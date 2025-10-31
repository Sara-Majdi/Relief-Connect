// app/api/analytics/donors/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  try {
    const supabase = await createClient();

    // Get query parameters for date range
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

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

    if (donationsError) throw donationsError;

    // Get unique donors
    const donorMap = new Map();
    donations.forEach(donation => {
      const donorId = donation.donor_id || donation.donor_email;
      if (!donorMap.has(donorId)) {
        donorMap.set(donorId, {
          id: donorId,
          name: donation.donor_name,
          email: donation.donor_email,
          totalDonated: 0,
          donationCount: 0,
          lastDonation: donation.created_at,
          firstDonation: donation.created_at
        });
      }
      const donor = donorMap.get(donorId);
      donor.totalDonated += parseFloat(donation.amount) || 0;
      donor.donationCount += 1;

      // Update first and last donation dates
      if (new Date(donation.created_at) > new Date(donor.lastDonation)) {
        donor.lastDonation = donation.created_at;
      }
      if (new Date(donation.created_at) < new Date(donor.firstDonation)) {
        donor.firstDonation = donation.created_at;
      }
    });

    const donors = Array.from(donorMap.values());

    // Donor growth over time
    const donorsByDate = donations.reduce((acc, donation) => {
      const date = new Date(donation.created_at).toISOString().split('T')[0];
      const donorId = donation.donor_id || donation.donor_email;

      if (!acc[date]) {
        acc[date] = new Set();
      }
      acc[date].add(donorId);
      return acc;
    }, {});

    const donorGrowth = Object.entries(donorsByDate)
      .map(([date, donorSet]) => ({
        date,
        newDonors: donorSet.size,
        cumulativeDonors: 0 // Will be calculated below
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate cumulative donors
    let cumulative = 0;
    const seenDonors = new Set();
    donorGrowth.forEach(day => {
      const date = day.date;
      donorsByDate[date].forEach(donorId => {
        if (!seenDonors.has(donorId)) {
          cumulative += 1;
          seenDonors.add(donorId);
        }
      });
      day.cumulativeDonors = cumulative;
    });

    // Donor segments
    const segments = {
      platinum: donors.filter(d => d.totalDonated > 5000).length,
      gold: donors.filter(d => d.totalDonated >= 2000 && d.totalDonated <= 5000).length,
      silver: donors.filter(d => d.totalDonated >= 1000 && d.totalDonated < 2000).length,
      bronze: donors.filter(d => d.totalDonated >= 500 && d.totalDonated < 1000).length,
      supporter: donors.filter(d => d.totalDonated < 500).length
    };

    // Donor retention (returning donors)
    const returningDonors = donors.filter(d => d.donationCount > 1).length;
    const newDonors = donors.filter(d => d.donationCount === 1).length;
    const retentionRate = donors.length > 0 ? (returningDonors / donors.length) * 100 : 0;

    // Average days between donations for returning donors
    const returningDonorsList = donors.filter(d => d.donationCount > 1);
    const avgDaysBetween = returningDonorsList.length > 0
      ? returningDonorsList.reduce((sum, donor) => {
          const daysDiff = Math.round(
            (new Date(donor.lastDonation) - new Date(donor.firstDonation)) /
            (1000 * 60 * 60 * 24)
          );
          return sum + (daysDiff / (donor.donationCount - 1));
        }, 0) / returningDonorsList.length
      : 0;

    // Top donors
    const topDonors = donors
      .sort((a, b) => b.totalDonated - a.totalDonated)
      .slice(0, 20)
      .map((donor, index) => ({
        rank: index + 1,
        name: donor.name || 'Anonymous',
        email: donor.email,
        totalDonated: donor.totalDonated,
        donationCount: donor.donationCount,
        lastDonation: donor.lastDonation,
        segment: donor.totalDonated > 5000 ? 'Platinum' :
                 donor.totalDonated >= 2000 ? 'Gold' :
                 donor.totalDonated >= 1000 ? 'Silver' :
                 donor.totalDonated >= 500 ? 'Bronze' : 'Supporter'
      }));

    // Donor lifetime value
    const avgLifetimeValue = donors.length > 0
      ? donors.reduce((sum, d) => sum + d.totalDonated, 0) / donors.length
      : 0;

    return NextResponse.json({
      summary: {
        totalDonors: donors.length,
        returningDonors,
        newDonors,
        retentionRate: Math.round(retentionRate * 10) / 10,
        avgLifetimeValue: Math.round(avgLifetimeValue * 100) / 100,
        avgDaysBetweenDonations: Math.round(avgDaysBetween)
      },
      donorGrowth,
      segments,
      topDonors,
      retention: {
        returning: returningDonors,
        new: newDonors,
        rate: retentionRate
      }
    });

  } catch (error) {
    console.error('Donor analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
