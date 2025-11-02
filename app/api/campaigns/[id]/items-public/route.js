import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/campaigns/[id]/items-public - Public endpoint to fetch campaign items (bypasses RLS)
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const supabase = await createClient();

    // Fetch all active items for the campaign
    const { data: items, error } = await supabase
      .from('campaign_items')
      .select('*')
      .eq('campaign_id', id)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching campaign items:', error);
      return NextResponse.json(
        { error: 'Failed to fetch campaign items', details: error.message },
        { status: 500 }
      );
    }

    // Calculate additional metrics for each item
    const itemsWithMetrics = (items || []).map(item => ({
      ...item,
      progress_percentage: item.target_amount > 0
        ? Math.round((item.current_amount / item.target_amount) * 100)
        : 0,
      remaining_amount: Math.max(0, item.target_amount - item.current_amount),
      is_fully_funded: item.current_amount >= item.target_amount,
    }));

    return NextResponse.json({
      success: true,
      items: itemsWithMetrics,
      count: itemsWithMetrics.length
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/campaigns/[id]/items-public:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
