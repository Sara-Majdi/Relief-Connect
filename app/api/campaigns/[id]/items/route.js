import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// GET /api/campaigns/[id]/items - Fetch all items for a campaign
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const supabase = createClient();

    // Fetch all active items for the campaign, ordered by display_order and priority
    const { data: items, error } = await supabase
      .from('campaign_items')
      .select('*')
      .eq('campaign_id', id)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching campaign items:', error);
      return NextResponse.json(
        { error: 'Failed to fetch campaign items' },
        { status: 500 }
      );
    }

    // Calculate additional metrics for each item
    const itemsWithMetrics = items.map(item => ({
      ...item,
      progress_percentage: item.target_amount > 0
        ? Math.round((item.current_amount / item.target_amount) * 100)
        : 0,
      remaining_amount: Math.max(0, item.target_amount - item.current_amount),
      is_fully_funded: item.current_amount >= item.target_amount,
      units_remaining: item.quantity && item.unit_cost
        ? Math.max(0, item.quantity - Math.floor(item.current_amount / item.unit_cost))
        : null
    }));

    return NextResponse.json({
      success: true,
      items: itemsWithMetrics,
      count: itemsWithMetrics.length
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/campaigns/[id]/items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/campaigns/[id]/items - Create new item (NGO only)
export async function POST(request, { params }) {
  try {
    const { id: campaignId } = params;
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

    // Verify the campaign belongs to this NGO
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('ngo_user_id, goal, raised')
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

    // Parse request body
    const body = await request.json();
    const {
      name,
      description,
      target_amount,
      quantity,
      unit_cost,
      priority = 'medium',
      category,
      image_url,
      display_order = 0
    } = body;

    // Validation
    if (!name || !target_amount) {
      return NextResponse.json(
        { error: 'Name and target amount are required' },
        { status: 400 }
      );
    }

    if (target_amount <= 0) {
      return NextResponse.json(
        { error: 'Target amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Check if total allocated items would exceed campaign goal
    const { data: existingItems } = await supabase
      .from('campaign_items')
      .select('target_amount')
      .eq('campaign_id', campaignId)
      .eq('is_active', true);

    const currentTotalAllocated = existingItems?.reduce(
      (sum, item) => sum + parseFloat(item.target_amount),
      0
    ) || 0;

    const newTotalAllocated = currentTotalAllocated + parseFloat(target_amount);

    if (newTotalAllocated > campaign.goal) {
      return NextResponse.json(
        {
          error: 'Total item allocations would exceed campaign goal',
          current_allocated: currentTotalAllocated,
          campaign_goal: campaign.goal,
          available: campaign.goal - currentTotalAllocated
        },
        { status: 400 }
      );
    }

    // Create the item
    const { data: newItem, error: insertError } = await supabase
      .from('campaign_items')
      .insert({
        campaign_id: campaignId,
        name,
        description,
        target_amount: parseFloat(target_amount),
        quantity: quantity ? parseInt(quantity) : null,
        unit_cost: unit_cost ? parseFloat(unit_cost) : null,
        priority,
        category,
        image_url,
        display_order,
        current_amount: 0,
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating campaign item:', insertError);
      return NextResponse.json(
        { error: 'Failed to create campaign item' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      item: newItem,
      message: 'Campaign item created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error in POST /api/campaigns/[id]/items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/campaigns/[id]/items - Bulk update items (NGO only)
export async function PUT(request, { params }) {
  try {
    const { id: campaignId } = params;
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

    // Parse request body (expecting array of items)
    const { items } = await request.json();

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items must be an array' },
        { status: 400 }
      );
    }

    // Validate total doesn't exceed campaign goal
    const totalAllocated = items.reduce(
      (sum, item) => sum + parseFloat(item.target_amount || 0),
      0
    );

    if (totalAllocated > campaign.goal) {
      return NextResponse.json(
        {
          error: 'Total item allocations exceed campaign goal',
          total_allocated: totalAllocated,
          campaign_goal: campaign.goal
        },
        { status: 400 }
      );
    }

    // Update each item
    const updates = [];
    for (const item of items) {
      if (item.id) {
        // Update existing item
        const { error } = await supabase
          .from('campaign_items')
          .update({
            name: item.name,
            description: item.description,
            target_amount: parseFloat(item.target_amount),
            quantity: item.quantity ? parseInt(item.quantity) : null,
            unit_cost: item.unit_cost ? parseFloat(item.unit_cost) : null,
            priority: item.priority,
            category: item.category,
            image_url: item.image_url,
            display_order: item.display_order,
            is_active: item.is_active !== undefined ? item.is_active : true,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id)
          .eq('campaign_id', campaignId);

        if (error) {
          console.error('Error updating item:', error);
          updates.push({ id: item.id, success: false, error: error.message });
        } else {
          updates.push({ id: item.id, success: true });
        }
      }
    }

    return NextResponse.json({
      success: true,
      updates,
      message: 'Items updated successfully'
    });

  } catch (error) {
    console.error('Unexpected error in PUT /api/campaigns/[id]/items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/campaigns/[id]/items - Delete item (soft delete)
export async function DELETE(request, { params }) {
  try {
    const { id: campaignId } = params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

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
      .select('ngo_user_id')
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

    // Check if item has donations
    const { data: donations, error: donationError } = await supabase
      .from('donations')
      .select('id')
      .eq('item_id', itemId)
      .limit(1);

    if (donationError) {
      console.error('Error checking donations:', donationError);
    }

    // If item has donations, soft delete (mark inactive)
    // Otherwise, hard delete
    if (donations && donations.length > 0) {
      const { error } = await supabase
        .from('campaign_items')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .eq('campaign_id', campaignId);

      if (error) {
        console.error('Error soft deleting item:', error);
        return NextResponse.json(
          { error: 'Failed to delete item' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Item deactivated (has existing donations)',
        soft_delete: true
      });
    } else {
      const { error } = await supabase
        .from('campaign_items')
        .delete()
        .eq('id', itemId)
        .eq('campaign_id', campaignId);

      if (error) {
        console.error('Error deleting item:', error);
        return NextResponse.json(
          { error: 'Failed to delete item' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Item deleted successfully',
        soft_delete: false
      });
    }

  } catch (error) {
    console.error('Unexpected error in DELETE /api/campaigns/[id]/items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
