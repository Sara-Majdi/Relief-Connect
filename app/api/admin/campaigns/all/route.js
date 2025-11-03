import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Get filter parameters
    const state = searchParams.get('state');
    const disasterType = searchParams.get('disasterType');
    const ngoName = searchParams.get('ngoName');
    const urgency = searchParams.get('urgency');
    const searchQuery = searchParams.get('search');

    console.log('Fetching all campaigns with filters:', { state, disasterType, ngoName, urgency, searchQuery });

    // Build query - simplified to avoid join issues
    let query = supabase
      .from('campaigns')
      .select('*')
      .order('id', { ascending: false });

    // Apply filters
    if (state && state !== 'all') {
      query = query.eq('state', state);
    }

    if (disasterType && disasterType !== 'all') {
      query = query.ilike('disaster', `%${disasterType}%`);
    }

    if (urgency && urgency !== 'all') {
      query = query.eq('urgency', urgency);
    }

    const { data: campaigns, error } = await query;

    if (error) {
      console.error('Error fetching campaigns:', error);
      return NextResponse.json(
        { error: 'Failed to fetch campaigns', details: error.message },
        { status: 500 }
      );
    }

    console.log(`Found ${campaigns?.length || 0} campaigns`);

    // Fetch NGO user details separately
    const campaignIds = campaigns.map(c => c.ngo_user_id).filter(Boolean);
    let ngoUsers = {};

    if (campaignIds.length > 0) {
      const { data: ngoData, error: ngoError } = await supabase
        .from('ngo_users')
        .select('id, org_name, email, org_type')
        .in('id', campaignIds);

      if (!ngoError && ngoData) {
        ngoUsers = ngoData.reduce((acc, ngo) => {
          acc[ngo.id] = ngo;
          return acc;
        }, {});
      }
    }

    // Enrich campaigns with calculated fields
    let enrichedCampaigns = campaigns.map(campaign => {
      const progress = campaign.goal > 0 ? (campaign.raised / campaign.goal) * 100 : 0;
      const daysRunning = campaign.start_date
        ? Math.floor((new Date() - new Date(campaign.start_date)) / (1000 * 60 * 60 * 24))
        : 0;
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
        organizerType: ngoUser?.org_type || '',
        image_url: campaign.image_url,
        start_date: campaign.start_date,
        target_date: campaign.target_date,
        verified: campaign.verified,
        daysRunning,
        status: progress >= 100 ? 'completed' : 'active'
      };
    });

    // Apply additional filters (client-side filters for NGO name and search)
    if (ngoName && ngoName !== 'all') {
      enrichedCampaigns = enrichedCampaigns.filter(c =>
        c.organizer.toLowerCase().includes(ngoName.toLowerCase())
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      enrichedCampaigns = enrichedCampaigns.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.organizer.toLowerCase().includes(query) ||
        c.state?.toLowerCase().includes(query) ||
        c.disaster?.toLowerCase().includes(query)
      );
    }

    // Get unique values for filters
    const uniqueStates = [...new Set(campaigns.map(c => c.state).filter(Boolean))].sort();
    const uniqueDisasterTypes = [...new Set(campaigns.map(c => c.disaster).filter(Boolean))].sort();
    const uniqueNGOs = [...new Set(campaigns.map(c =>
      c.ngo_users?.org_name || c.organizer
    ).filter(Boolean))].sort();

    // Calculate summary statistics
    const summary = {
      totalCampaigns: enrichedCampaigns.length,
      activeCampaigns: enrichedCampaigns.filter(c => c.status === 'active').length,
      completedCampaigns: enrichedCampaigns.filter(c => c.status === 'completed').length,
      totalRaised: enrichedCampaigns.reduce((sum, c) => sum + c.raised, 0),
      totalGoal: enrichedCampaigns.reduce((sum, c) => sum + c.goal, 0),
      totalDonors: enrichedCampaigns.reduce((sum, c) => sum + c.donors, 0),
      avgProgress: enrichedCampaigns.length > 0
        ? enrichedCampaigns.reduce((sum, c) => sum + c.progress, 0) / enrichedCampaigns.length
        : 0
    };

    return NextResponse.json({
      campaigns: enrichedCampaigns,
      filters: {
        states: uniqueStates,
        disasterTypes: uniqueDisasterTypes,
        ngos: uniqueNGOs,
        urgencyLevels: ['critical', 'urgent', 'normal']
      },
      summary
    });

  } catch (error) {
    console.error('Error in campaigns API:', error);
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
