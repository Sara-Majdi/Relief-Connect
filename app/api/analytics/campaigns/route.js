// app/api/analytics/campaigns/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  try {
    const supabase = await createClient();

    // Get query parameters for date range
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Fetch all campaigns with optional date filter
    let campaignsQuery = supabase
      .from('campaigns')
      .select('*');

    if (startDate && endDate) {
      campaignsQuery = campaignsQuery
        .gte('created_at', startDate)
        .lte('created_at', endDate);
    }

    const { data: campaigns, error: campaignsError } = await campaignsQuery;

    if (campaignsError) throw campaignsError;

    // Disaster type breakdown
    const disasterTypes = campaigns.reduce((acc, campaign) => {
      const disaster = campaign.disaster || 'Unknown';
      if (!acc[disaster]) {
        acc[disaster] = { count: 0, raised: 0 };
      }
      acc[disaster].count += 1;
      acc[disaster].raised += parseFloat(campaign.raised || 0);
      return acc;
    }, {});

    // Urgency distribution
    const urgencyDistribution = campaigns.reduce((acc, campaign) => {
      const urgency = campaign.urgency || 'normal';
      if (!acc[urgency]) {
        acc[urgency] = { count: 0, raised: 0, goal: 0 };
      }
      acc[urgency].count += 1;
      acc[urgency].raised += parseFloat(campaign.raised || 0);
      acc[urgency].goal += parseFloat(campaign.goal || 0);
      return acc;
    }, {});

    // Geographic distribution (by state)
    const geographicDistribution = campaigns.reduce((acc, campaign) => {
      const state = campaign.state || 'Unknown';
      if (!acc[state]) {
        acc[state] = { count: 0, raised: 0, donors: 0 };
      }
      acc[state].count += 1;
      acc[state].raised += parseFloat(campaign.raised || 0);
      acc[state].donors += campaign.donors || 0;
      return acc;
    }, {});

    // Campaign progress stages
    const progressStages = {
      created: campaigns.length,
      withDonations: campaigns.filter(c => parseFloat(c.raised || 0) > 0).length,
      halfFunded: campaigns.filter(c =>
        parseFloat(c.raised || 0) >= parseFloat(c.goal || 1) * 0.5
      ).length,
      fullyFunded: campaigns.filter(c =>
        parseFloat(c.raised || 0) >= parseFloat(c.goal || 1)
      ).length
    };

    // Campaign status (active vs completed)
    const now = new Date();
    const activeCampaigns = campaigns.filter(c => {
      const targetDate = new Date(c.target_date);
      return targetDate > now && parseFloat(c.raised || 0) < parseFloat(c.goal || 1);
    }).length;
    const completedCampaigns = campaigns.filter(c => {
      const targetDate = new Date(c.target_date);
      return targetDate <= now || parseFloat(c.raised || 0) >= parseFloat(c.goal || 1);
    }).length;

    // Average campaign duration
    const campaignDurations = campaigns.map(c => {
      const start = new Date(c.start_date);
      const target = new Date(c.target_date);
      return Math.round((target - start) / (1000 * 60 * 60 * 24)); // days
    }).filter(d => d > 0);

    const avgDuration = campaignDurations.length > 0
      ? campaignDurations.reduce((sum, d) => sum + d, 0) / campaignDurations.length
      : 0;

    return NextResponse.json({
      summary: {
        totalCampaigns: campaigns.length,
        activeCampaigns,
        completedCampaigns,
        avgDuration: Math.round(avgDuration)
      },
      disasterTypes,
      urgencyDistribution,
      geographicDistribution,
      progressStages,
      statusBreakdown: {
        active: activeCampaigns,
        completed: completedCampaigns
      }
    });

  } catch (error) {
    console.error('Campaign analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
