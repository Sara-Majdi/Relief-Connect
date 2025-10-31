// app/api/analytics/operational/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  try {
    const supabase = await createClient();

    // Get query parameters for date range
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Fetch NGO registrations for admin activity
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

    // Fetch donations
    let donationsQuery = supabase
      .from('donations')
      .select('*')
      .eq('status', 'completed');

    if (startDate && endDate) {
      donationsQuery = donationsQuery
        .gte('created_at', startDate)
        .lte('created_at', endDate);
    }

    const { data: donations, error: donationsError } = await donationsQuery;
    if (donationsError) throw donationsError;

    // Admin activity metrics (based on reviewed NGOs)
    const adminActions = ngos.filter(n => n.reviewed_at).map(ngo => ({
      type: ngo.status === 'approved' ? 'approval' : 'rejection',
      date: ngo.reviewed_at,
      reviewedBy: ngo.reviewed_by || 'Admin'
    }));

    // Group admin actions by date
    const actionsByDate = adminActions.reduce((acc, action) => {
      const date = new Date(action.date).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, approvals: 0, rejections: 0, total: 0 };
      }
      if (action.type === 'approval') {
        acc[date].approvals += 1;
      } else {
        acc[date].rejections += 1;
      }
      acc[date].total += 1;
      return acc;
    }, {});

    const adminActivityTimeline = Object.values(actionsByDate).sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    );

    // Campaign lifecycle metrics
    const campaignLifecycles = campaigns.map(campaign => {
      const created = new Date(campaign.created_at);
      const target = new Date(campaign.target_date);
      const daysToTarget = Math.round((target - created) / (1000 * 60 * 60 * 24));

      // Calculate days to first donation (if any)
      const campaignDonations = donations.filter(d => d.campaign_id === campaign.id);
      let daysToFirstDonation = null;
      if (campaignDonations.length > 0) {
        const firstDonation = campaignDonations.sort((a, b) =>
          new Date(a.created_at) - new Date(b.created_at)
        )[0];
        const firstDonationDate = new Date(firstDonation.created_at);
        daysToFirstDonation = Math.round((firstDonationDate - created) / (1000 * 60 * 60 * 24));
      }

      // Calculate days to goal (if reached)
      let daysToGoal = null;
      if (parseFloat(campaign.raised || 0) >= parseFloat(campaign.goal || 1)) {
        // Find the donation that pushed it over the goal
        const sortedDonations = campaignDonations.sort((a, b) =>
          new Date(a.created_at) - new Date(b.created_at)
        );
        let cumulativeRaised = 0;
        for (const donation of sortedDonations) {
          cumulativeRaised += parseFloat(donation.amount || 0);
          if (cumulativeRaised >= parseFloat(campaign.goal || 1)) {
            const goalReachedDate = new Date(donation.created_at);
            daysToGoal = Math.round((goalReachedDate - created) / (1000 * 60 * 60 * 24));
            break;
          }
        }
      }

      return {
        id: campaign.id,
        title: campaign.title,
        daysToTarget,
        daysToFirstDonation,
        daysToGoal,
        raised: parseFloat(campaign.raised || 0),
        goal: parseFloat(campaign.goal || 1)
      };
    });

    // Average metrics
    const avgDaysToFirstDonation = campaignLifecycles
      .filter(c => c.daysToFirstDonation !== null)
      .reduce((sum, c) => sum + c.daysToFirstDonation, 0) /
      campaignLifecycles.filter(c => c.daysToFirstDonation !== null).length || 0;

    const avgDaysToGoal = campaignLifecycles
      .filter(c => c.daysToGoal !== null)
      .reduce((sum, c) => sum + c.daysToGoal, 0) /
      campaignLifecycles.filter(c => c.daysToGoal !== null).length || 0;

    // Campaigns needing attention (< 10% funded after 7 days)
    const now = new Date();
    const campaignsNeedingAttention = campaigns.filter(campaign => {
      const created = new Date(campaign.created_at);
      const daysSinceCreated = Math.round((now - created) / (1000 * 60 * 60 * 24));
      const fundingProgress = (parseFloat(campaign.raised || 0) / parseFloat(campaign.goal || 1)) * 100;

      return daysSinceCreated >= 7 && fundingProgress < 10;
    });

    // Campaigns about to expire (target date within 7 days)
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const campaignsAboutToExpire = campaigns.filter(campaign => {
      const target = new Date(campaign.target_date);
      return target <= sevenDaysFromNow && target > now &&
             parseFloat(campaign.raised || 0) < parseFloat(campaign.goal || 1);
    });

    // Failed donations (if tracked - for now we'll just count pending/failed status)
    const failedDonationsQuery = await supabase
      .from('donations')
      .select('*')
      .in('status', ['failed', 'pending']);

    const failedDonations = failedDonationsQuery.data || [];

    // Platform health score (0-100)
    const healthFactors = {
      pendingNgoApplications: ngos.filter(n => n.status === 'pending').length,
      campaignsNeedingAttention: campaignsNeedingAttention.length,
      campaignsAboutToExpire: campaignsAboutToExpire.length,
      failedDonations: failedDonations.length
    };

    // Simple health score calculation
    let healthScore = 100;
    healthScore -= Math.min(healthFactors.pendingNgoApplications * 2, 20);
    healthScore -= Math.min(healthFactors.campaignsNeedingAttention * 3, 30);
    healthScore -= Math.min(healthFactors.campaignsAboutToExpire * 2, 20);
    healthScore -= Math.min(healthFactors.failedDonations * 1, 20);
    healthScore = Math.max(healthScore, 0);

    // Admin workload distribution (by reviewer)
    const workloadByReviewer = adminActions.reduce((acc, action) => {
      const reviewer = action.reviewedBy;
      if (!acc[reviewer]) {
        acc[reviewer] = { approvals: 0, rejections: 0, total: 0 };
      }
      if (action.type === 'approval') {
        acc[reviewer].approvals += 1;
      } else {
        acc[reviewer].rejections += 1;
      }
      acc[reviewer].total += 1;
      return acc;
    }, {});

    return NextResponse.json({
      summary: {
        totalActions: adminActions.length,
        avgDaysToFirstDonation: Math.round(avgDaysToFirstDonation * 10) / 10,
        avgDaysToGoal: Math.round(avgDaysToGoal * 10) / 10,
        healthScore: Math.round(healthScore)
      },
      adminActivityTimeline,
      campaignLifecycles: {
        avgDaysToFirstDonation: Math.round(avgDaysToFirstDonation * 10) / 10,
        avgDaysToGoal: Math.round(avgDaysToGoal * 10) / 10,
        distribution: campaignLifecycles.map(c => ({
          title: c.title,
          daysToFirstDonation: c.daysToFirstDonation,
          daysToGoal: c.daysToGoal
        }))
      },
      platformHealth: {
        score: Math.round(healthScore),
        factors: healthFactors,
        campaignsNeedingAttention: campaignsNeedingAttention.map(c => ({
          id: c.id,
          title: c.title,
          raised: parseFloat(c.raised || 0),
          goal: parseFloat(c.goal || 1),
          progress: (parseFloat(c.raised || 0) / parseFloat(c.goal || 1)) * 100
        })),
        campaignsAboutToExpire: campaignsAboutToExpire.map(c => ({
          id: c.id,
          title: c.title,
          targetDate: c.target_date,
          raised: parseFloat(c.raised || 0),
          goal: parseFloat(c.goal || 1)
        }))
      },
      workloadByReviewer
    });

  } catch (error) {
    console.error('Operational analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
