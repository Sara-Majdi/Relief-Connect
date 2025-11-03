import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'raised'; // raised, donors, progress

    console.log('Fetching top 10 campaigns with sortBy:', sortBy);

    // Fetch campaigns with NGO user details and location
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching campaigns:', error);
      return NextResponse.json(
        { error: 'Failed to fetch campaigns', details: error.message },
        { status: 500 }
      );
    }

    console.log(`Found ${campaigns?.length || 0} campaigns`);

    // Fetch NGO user details separately if needed
    const campaignIds = campaigns.map(c => c.ngo_user_id).filter(Boolean);
    let ngoUsers = {};

    if (campaignIds.length > 0) {
      const { data: ngoData, error: ngoError } = await supabase
        .from('ngo_users')
        .select('id, org_name, email')
        .in('id', campaignIds);

      if (!ngoError && ngoData) {
        ngoUsers = ngoData.reduce((acc, ngo) => {
          acc[ngo.id] = ngo;
          return acc;
        }, {});
      }
    }

    // Calculate progress and prepare campaign data
    const enrichedCampaigns = campaigns.map(campaign => {
      const progress = campaign.goal > 0 ? (campaign.raised / campaign.goal) * 100 : 0;
      const ngoUser = ngoUsers[campaign.ngo_user_id];

      return {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        raised: campaign.raised || 0,
        goal: campaign.goal || 0,
        progress: Math.min(progress, 100),
        donors: campaign.donors || 0,
        state: campaign.state,
        location: campaign.location,
        disaster: campaign.disaster,
        urgency: campaign.urgency,
        beneficiaries: campaign.beneficiaries,
        organizer: ngoUser?.org_name || campaign.organizer || campaign.ngo || 'Unknown',
        organizerEmail: ngoUser?.email || '',
        image_url: campaign.image_url,
        start_date: campaign.start_date,
        target_date: campaign.target_date,
        verified: campaign.verified
      };
    });

    // Sort campaigns based on sortBy parameter
    let sortedCampaigns = [...enrichedCampaigns];

    switch (sortBy) {
      case 'raised':
        sortedCampaigns.sort((a, b) => b.raised - a.raised);
        break;
      case 'donors':
        sortedCampaigns.sort((a, b) => b.donors - a.donors);
        break;
      case 'progress':
        sortedCampaigns.sort((a, b) => b.progress - a.progress);
        break;
      case 'recent':
        sortedCampaigns.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      default:
        sortedCampaigns.sort((a, b) => b.raised - a.raised);
    }

    // Get top 10
    const top10 = sortedCampaigns.slice(0, 10);

    // Calculate summary statistics
    const summary = {
      totalCampaigns: campaigns.length,
      totalRaised: campaigns.reduce((sum, c) => sum + (c.raised || 0), 0),
      totalGoal: campaigns.reduce((sum, c) => sum + (c.goal || 0), 0),
      totalDonors: campaigns.reduce((sum, c) => sum + (c.donors || 0), 0),
      avgProgress: enrichedCampaigns.length > 0
        ? enrichedCampaigns.reduce((sum, c) => sum + c.progress, 0) / enrichedCampaigns.length
        : 0
    };

    return NextResponse.json({
      top10,
      summary
    });

  } catch (error) {
    console.error('Error in top-10 campaigns API:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
