// app/api/analytics/ngos/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  try {
    const supabase = await createClient();

    // Get query parameters for date range
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Fetch all NGO registrations
    let ngoQuery = supabase
      .from('ngo_registrations')
      .select('*');

    if (startDate && endDate) {
      ngoQuery = ngoQuery
        .gte('created_at', startDate)
        .lte('created_at', endDate);
    }

    const { data: ngos, error: ngosError } = await ngoQuery;

    if (ngosError) throw ngosError;

    // Fetch campaigns
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('ngo, ngo_user_id, raised, goal, donors, created_at');

    if (campaignsError) throw campaignsError;

    // Application pipeline
    const applicationPipeline = {
      pending: ngos.filter(n => n.status === 'pending').length,
      underReview: ngos.filter(n => n.status === 'under-review').length,
      approved: ngos.filter(n => n.status === 'approved').length,
      rejected: ngos.filter(n => n.status === 'rejected').length
    };

    // Approval rate
    const totalProcessed = applicationPipeline.approved + applicationPipeline.rejected;
    const approvalRate = totalProcessed > 0
      ? (applicationPipeline.approved / totalProcessed) * 100
      : 0;

    // Average review time (for reviewed applications)
    const reviewedNgos = ngos.filter(n => n.reviewed_at);
    const avgReviewTime = reviewedNgos.length > 0
      ? reviewedNgos.reduce((sum, ngo) => {
          const created = new Date(ngo.created_at);
          const reviewed = new Date(ngo.reviewed_at);
          const days = Math.round((reviewed - created) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / reviewedNgos.length
      : 0;

    // NGO by organization type
    const orgTypes = ngos.reduce((acc, ngo) => {
      const type = ngo.org_type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // NGO by focus area
    const focusAreas = ngos.reduce((acc, ngo) => {
      const area = ngo.focus_area || 'Unknown';
      if (!acc[area]) {
        acc[area] = { count: 0, raised: 0 };
      }
      acc[area].count += 1;

      // Sum funds raised by NGOs in this focus area
      const ngoName = ngo.org_name;
      const ngoRaised = campaigns
        .filter(c => c.ngo === ngoName)
        .reduce((sum, c) => sum + (parseFloat(c.raised) || 0), 0);
      acc[area].raised += ngoRaised;

      return acc;
    }, {});

    // Campaign count per NGO
    const campaignsByNgo = campaigns.reduce((acc, campaign) => {
      const ngo = campaign.ngo || 'Unknown';
      if (!acc[ngo]) {
        acc[ngo] = { count: 0, raised: 0, donors: 0 };
      }
      acc[ngo].count += 1;
      acc[ngo].raised += parseFloat(campaign.raised || 0);
      acc[ngo].donors += campaign.donors || 0;
      return acc;
    }, {});

    const topNgosByFunds = Object.entries(campaignsByNgo)
      .sort(([, a], [, b]) => b.raised - a.raised)
      .slice(0, 10)
      .map(([ngo, data], index) => ({
        rank: index + 1,
        name: ngo,
        campaigns: data.count,
        raised: data.raised,
        donors: data.donors,
        avgPerCampaign: data.count > 0 ? data.raised / data.count : 0
      }));

    const topNgosByCampaigns = Object.entries(campaignsByNgo)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10)
      .map(([ngo, data], index) => ({
        rank: index + 1,
        name: ngo,
        campaigns: data.count,
        raised: data.raised,
        avgPerCampaign: data.count > 0 ? data.raised / data.count : 0
      }));

    // Average metrics per NGO
    const ngoCount = Object.keys(campaignsByNgo).length;
    const avgCampaignsPerNgo = ngoCount > 0
      ? campaigns.length / ngoCount
      : 0;

    const avgFundsPerNgo = ngoCount > 0
      ? Object.values(campaignsByNgo).reduce((sum, ngo) => sum + ngo.raised, 0) / ngoCount
      : 0;

    // NGO success rate (campaigns that met goal)
    const successfulCampaigns = campaigns.filter(c =>
      parseFloat(c.raised || 0) >= parseFloat(c.goal || 1)
    ).length;
    const successRate = campaigns.length > 0
      ? (successfulCampaigns / campaigns.length) * 100
      : 0;

    // Document submission rate
    const ngosWithAllDocs = ngos.filter(n =>
      n.registration_cert_url && n.tax_exemption_cert_url && n.annual_report_url
    ).length;
    const docSubmissionRate = ngos.length > 0
      ? (ngosWithAllDocs / ngos.length) * 100
      : 0;

    return NextResponse.json({
      summary: {
        totalNgos: ngos.length,
        approvedNgos: applicationPipeline.approved,
        pendingNgos: applicationPipeline.pending,
        approvalRate: Math.round(approvalRate * 10) / 10,
        avgReviewTime: Math.round(avgReviewTime),
        avgCampaignsPerNgo: Math.round(avgCampaignsPerNgo * 10) / 10,
        avgFundsPerNgo: Math.round(avgFundsPerNgo * 100) / 100,
        successRate: Math.round(successRate * 10) / 10
      },
      applicationPipeline,
      orgTypes,
      focusAreas,
      topNgosByFunds,
      topNgosByCampaigns,
      documentSubmission: {
        withAllDocs: ngosWithAllDocs,
        rate: Math.round(docSubmissionRate * 10) / 10
      }
    });

  } catch (error) {
    console.error('NGO analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
