// app/api/analytics/financial/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  try {
    const supabase = await createClient();

    // Get query parameters for date range
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    console.log('Fetching financial analytics with date range:', { startDate, endDate });

    // Fetch all donations with date filter
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

    if (donationsError) {
      console.error('Donations query error:', donationsError);
      throw donationsError;
    }

    console.log(`Found ${donations?.length || 0} donations`);

    // Fetch campaigns for top performers - REMOVED created_at
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, title, goal, raised, donors');

    if (campaignsError) {
      console.error('Campaigns query error:', campaignsError);
      throw campaignsError;
    }

    console.log(`Found ${campaigns?.length || 0} campaigns`);

    // Handle case where there are no donations
    if (!donations || donations.length === 0) {
      return NextResponse.json({
        summary: {
          totalRevenue: 0,
          totalDonations: 0,
          totalTips: 0,
          avgDonation: 0,
          donationCount: 0
        },
        revenueTrends: [{
          date: new Date().toISOString().split('T')[0],
          amount: 0,
          tips: 0,
          count: 0
        }],
        donationDistribution: {
          small: 0,
          medium: 0,
          large: 0,
          major: 0,
        },
        recurringVsOneTime: {
          recurring: 0,
          oneTime: 0
        },
        topCampaigns: []
      });
    }

    // Calculate total revenue
    const totalDonations = donations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    const totalTips = donations.reduce((sum, d) => sum + (parseFloat(d.tip_amount) || 0), 0);
    const totalRevenue = totalDonations + totalTips;

    // Calculate average donation
    const avgDonation = donations.length > 0 ? totalDonations / donations.length : 0;

    // Group donations by date for trends
    const donationsByDate = donations.reduce((acc, donation) => {
      const date = new Date(donation.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, amount: 0, tips: 0, count: 0 };
      }
      acc[date].amount += parseFloat(donation.amount) || 0;
      acc[date].tips += parseFloat(donation.tip_amount) || 0;
      acc[date].count += 1;
      return acc;
    }, {});

    const revenueTrends = Object.values(donationsByDate).sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    );

    // Donation distribution by amount
    const donationDistribution = {
      small: donations.filter(d => parseFloat(d.amount) < 50).length,
      medium: donations.filter(d => parseFloat(d.amount) >= 50 && parseFloat(d.amount) < 500).length,
      large: donations.filter(d => parseFloat(d.amount) >= 500 && parseFloat(d.amount) < 2000).length,
      major: donations.filter(d => parseFloat(d.amount) >= 2000).length,
    };

    // Recurring vs one-time
    const recurringCount = donations.filter(d => d.is_recurring).length;
    const oneTimeCount = donations.filter(d => !d.is_recurring).length;

    // Top performing campaigns
    const topCampaigns = (campaigns || [])
      .sort((a, b) => parseFloat(b.raised || 0) - parseFloat(a.raised || 0))
      .slice(0, 10)
      .map(c => ({
        id: c.id,
        title: c.title || 'Untitled Campaign',
        raised: parseFloat(c.raised || 0),
        goal: parseFloat(c.goal || 0),
        progress: (parseFloat(c.raised || 0) / parseFloat(c.goal || 1)) * 100,
        donors: c.donors || 0
      }));

    const response = {
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalDonations: Math.round(totalDonations * 100) / 100,
        totalTips: Math.round(totalTips * 100) / 100,
        avgDonation: Math.round(avgDonation * 100) / 100,
        donationCount: donations.length
      },
      revenueTrends,
      donationDistribution,
      recurringVsOneTime: {
        recurring: recurringCount,
        oneTime: oneTimeCount
      },
      topCampaigns
    };

    console.log('Financial analytics response prepared successfully');
    return NextResponse.json(response);

  } catch (error) {
    console.error('Financial analytics error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}