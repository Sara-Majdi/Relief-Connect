import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// GET /api/campaigns/[id]/items/[itemId] - Fetch single item details
export async function GET(request, { params }) {
  try {
    const { id: campaignId, itemId } = params;
    const supabase = createClient();

    // Fetch the item
    const { data: item, error } = await supabase
      .from('campaign_items')
      .select('*')
      .eq('id', itemId)
      .eq('campaign_id', campaignId)
      .single();

    if (error || !item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Fetch recent donations for this item
    const { data: recentDonations, error: donationsError } = await supabase
      .from('donations')
      .select('id, amount, donor_name, created_at')
      .eq('item_id', itemId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Calculate metrics
    const itemWithMetrics = {
      ...item,
      progress_percentage: item.target_amount > 0
        ? Math.round((item.current_amount / item.target_amount) * 100)
        : 0,
      remaining_amount: Math.max(0, item.target_amount - item.current_amount),
      is_fully_funded: item.current_amount >= item.target_amount,
      units_remaining: item.quantity && item.unit_cost
        ? Math.max(0, item.quantity - Math.floor(item.current_amount / item.unit_cost))
        : null,
      units_funded: item.quantity && item.unit_cost
        ? Math.min(item.quantity, Math.floor(item.current_amount / item.unit_cost))
        : null,
      recent_donations: recentDonations || [],
      total_donors: recentDonations?.length || 0
    };

    return NextResponse.json({
      success: true,
      item: itemWithMetrics
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/campaigns/[id]/items/[itemId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/campaigns/[id]/items/[itemId] - Update specific item (NGO only)
export async function PATCH(request, { params }) {
  try {
    const { id: campaignId, itemId } = params;
    const supabase = createClient();

    // Check NGO authentication
    const cookieStore = cookies();
    const ngoUserCookie = cookieStore.get('ngo_user');

    if (!ngoUserCookie) {
      return NextResponse.json(
        { error: 'Unauthorized: NGO authentication required' },
        { status: 401 }
      );
    }

    const ngoUser = JSON.parse(ngoUserCookie.value);

    // Verify campaign ownership
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('ngo_user_id, goal')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    if (campaign.ngo_user_id !== ngoUser.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this campaign' },
        { status: 403 }
      );
    }

    // Verify item exists and belongs to campaign
    const { data: existingItem, error: itemError } = await supabase
      .from('campaign_items')
      .select('*')
      .eq('id', itemId)
      .eq('campaign_id', campaignId)
      .single();

    if (itemError || !existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const updates = await request.json();

    // Build update object (only include provided fields)
    const updateData = {};
    const allowedFields = [
      'name',
      'description',
      'target_amount',
      'quantity',
      'unit_cost',
      'priority',
      'category',
      'image_url',
      'display_order',
      'is_active'
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        if (field === 'target_amount' || field === 'unit_cost') {
          updateData[field] = parseFloat(updates[field]);
        } else if (field === 'quantity' || field === 'display_order') {
          updateData[field] = parseInt(updates[field]);
        } else {
          updateData[field] = updates[field];
        }
      }
    }

    // If updating target_amount, validate against campaign goal
    if (updateData.target_amount !== undefined) {
      // Get total of other items
      const { data: otherItems } = await supabase
        .from('campaign_items')
        .select('target_amount')
        .eq('campaign_id', campaignId)
        .eq('is_active', true)
        .neq('id', itemId);

      const otherItemsTotal = otherItems?.reduce(
        (sum, item) => sum + parseFloat(item.target_amount),
        0
      ) || 0;

      const newTotal = otherItemsTotal + updateData.target_amount;

      if (newTotal > campaign.goal) {
        return NextResponse.json(
          {
            error: 'Updated target amount would exceed campaign goal',
            current_other_items: otherItemsTotal,
            new_total: newTotal,
            campaign_goal: campaign.goal,
            max_allowed: campaign.goal - otherItemsTotal
          },
          { status: 400 }
        );
      }

      // Warn if reducing target below current amount
      if (updateData.target_amount < existingItem.current_amount) {
        return NextResponse.json(
          {
            error: 'Target amount cannot be less than current raised amount',
            current_amount: existingItem.current_amount,
            requested_target: updateData.target_amount
          },
          { status: 400 }
        );
      }
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // Perform update
    const { data: updatedItem, error: updateError } = await supabase
      .from('campaign_items')
      .update(updateData)
      .eq('id', itemId)
      .eq('campaign_id', campaignId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating item:', updateError);
      return NextResponse.json(
        { error: 'Failed to update item' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      item: updatedItem,
      message: 'Item updated successfully'
    });

  } catch (error) {
    console.error('Unexpected error in PATCH /api/campaigns/[id]/items/[itemId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
