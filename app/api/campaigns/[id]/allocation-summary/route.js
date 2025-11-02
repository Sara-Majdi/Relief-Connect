import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/campaigns/[id]/allocation-summary - Get comprehensive allocation overview
export async function GET(request, { params }) {
  try {
    const { id: campaignId } = params;
    const supabase = createClient();

    // Fetch campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, title, goal, raised, donors')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Fetch all active items
    const { data: items, error: itemsError } = await supabase
      .from('campaign_items')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (itemsError) {
      console.error('Error fetching items:', itemsError);
      return NextResponse.json(
        { error: 'Failed to fetch items' },
        { status: 500 }
      );
    }

    // Calculate metrics
    const totalAllocated = items.reduce(
      (sum, item) => sum + parseFloat(item.target_amount),
      0
    );

    const totalItemsRaised = items.reduce(
      (sum, item) => sum + parseFloat(item.current_amount),
      0
    );

    const unallocatedTarget = Math.max(0, campaign.goal - totalAllocated);
    const unallocatedRaised = Math.max(0, campaign.raised - totalItemsRaised);

    // Categorize items by funding status
    const fullyFundedItems = items.filter(
      item => item.current_amount >= item.target_amount
    );
    const partiallyFundedItems = items.filter(
      item => item.current_amount > 0 && item.current_amount < item.target_amount
    );
    const unfundedItems = items.filter(
      item => item.current_amount === 0
    );

    // Categorize by priority
    const itemsByPriority = {
      critical: items.filter(item => item.priority === 'critical'),
      high: items.filter(item => item.priority === 'high'),
      medium: items.filter(item => item.priority === 'medium'),
      low: items.filter(item => item.priority === 'low')
    };

    // Calculate average funding percentage
    const avgFundingPercentage = items.length > 0
      ? items.reduce((sum, item) => {
          const percentage = item.target_amount > 0
            ? (item.current_amount / item.target_amount) * 100
            : 0;
          return sum + percentage;
        }, 0) / items.length
      : 0;

    // Get general fund donations (donations not tied to specific items)
    const { data: generalDonations, error: generalError } = await supabase
      .from('donations')
      .select('amount')
      .eq('campaign_id', campaignId)
      .eq('allocation_type', 'general');

    const totalGeneralDonations = generalDonations?.reduce(
      (sum, d) => sum + parseFloat(d.amount),
      0
    ) || 0;

    // Enhanced item metrics
    const itemsWithMetrics = items.map(item => {
      const progressPercentage = item.target_amount > 0
        ? Math.round((item.current_amount / item.target_amount) * 100)
        : 0;

      const remainingAmount = Math.max(0, item.target_amount - item.current_amount);
      const isFullyFunded = item.current_amount >= item.target_amount;
      const fundingStatus = isFullyFunded ? 'completed' :
                           item.current_amount > 0 ? 'in_progress' : 'not_started';

      return {
        ...item,
        progress_percentage: progressPercentage,
        remaining_amount: remainingAmount,
        is_fully_funded: isFullyFunded,
        funding_status: fundingStatus,
        units_funded: item.quantity && item.unit_cost
          ? Math.min(item.quantity, Math.floor(item.current_amount / item.unit_cost))
          : null,
        units_remaining: item.quantity && item.unit_cost
          ? Math.max(0, item.quantity - Math.floor(item.current_amount / item.unit_cost))
          : null
      };
    });

    // Build response
    const summary = {
      campaign: {
        id: campaign.id,
        title: campaign.title,
        goal: parseFloat(campaign.goal),
        raised: parseFloat(campaign.raised),
        donors: campaign.donors,
        progress_percentage: campaign.goal > 0
          ? Math.round((campaign.raised / campaign.goal) * 100)
          : 0,
        remaining: Math.max(0, campaign.goal - campaign.raised)
      },
      allocation: {
        total_allocated: totalAllocated,
        total_items_raised: totalItemsRaised,
        unallocated_target: unallocatedTarget,
        unallocated_raised: unallocatedRaised,
        allocation_percentage: campaign.goal > 0
          ? Math.round((totalAllocated / campaign.goal) * 100)
          : 0,
        total_general_donations: totalGeneralDonations
      },
      items: {
        total: items.length,
        fully_funded: fullyFundedItems.length,
        partially_funded: partiallyFundedItems.length,
        unfunded: unfundedItems.length,
        average_funding_percentage: Math.round(avgFundingPercentage),
        by_priority: {
          critical: itemsByPriority.critical.length,
          high: itemsByPriority.high.length,
          medium: itemsByPriority.medium.length,
          low: itemsByPriority.low.length
        },
        list: itemsWithMetrics
      },
      recommendations: {
        // Suggest items that need attention
        priority_unfunded: itemsWithMetrics
          .filter(item => !item.is_fully_funded && (item.priority === 'critical' || item.priority === 'high'))
          .sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          })
          .slice(0, 3),

        // Items close to being funded (80%+)
        almost_complete: itemsWithMetrics
          .filter(item => item.progress_percentage >= 80 && item.progress_percentage < 100)
          .sort((a, b) => b.progress_percentage - a.progress_percentage)
          .slice(0, 3)
      }
    };

    return NextResponse.json({
      success: true,
      summary
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/campaigns/[id]/allocation-summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
