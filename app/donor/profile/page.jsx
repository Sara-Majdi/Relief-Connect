import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DonorProfileClient from './DonorProfileClient';
import Link from "next/link"


export default async function DonorProfilePage() {
  //Get authenticated user data
  const supabase = await createClient();
  const session = await supabase.auth.getUser();

  if (!session.data.user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-4xl font-bold">Not Authenticated</h1>
        <Link className="btn" href="/auth">
          Sign In
        </Link>
      </div>
    );
  }

  const {
    data: {
      user: { user_metadata, app_metadata },
    },
  } = session;

  const { name, email, user_name, avatar_url } = user_metadata;
  
  // Fetch real donation data from database
  let donations = []
  let totalDonated = 0
  let totalDonations = 0
  let lastDonation = "No donations yet"
  let impactLevel = "New Supporter"

  try {
    // Check if donations table exists and fetch data
    const { data: donationData, error: donationError } = await supabase
      .from('donations')
      .select(`
        id,
        amount,
        tip_amount,
        total_amount,
        status,
        receipt_number,
        created_at,
        campaign_id,
        campaigns!donations_campaign_id_fkey (
          title,
          ngo,
          ngo_user_id
        )
      `)
      .eq('donor_id', session.data.user.id)
      .order('created_at', { ascending: false })

    if (donationError) {
      console.error('Error fetching donations:', donationError)
      // If table doesn't exist, use empty data
    } else if (donationData) {
      // Fetch NGO details for all campaigns
      const ngoUserIds = [...new Set(donationData.map(d => d.campaigns?.ngo_user_id).filter(Boolean))]
      const { data: ngoDetails } = await supabase
        .from('ngo_registrations')
        .select('user_id, org_name, registration_number, address, city, state, postal_code')
        .in('user_id', ngoUserIds)
        .eq('status', 'approved')

      // Create a map of ngo_user_id to ngo details
      const ngoMap = {}
      if (ngoDetails) {
        ngoDetails.forEach(ngo => {
          ngoMap[ngo.user_id] = {
            name: ngo.org_name,
            registrationNumber: ngo.registration_number,
            address: ngo.address,
            city: ngo.city,
            state: ngo.state,
            postalCode: ngo.postal_code
          }
        })
      }

      donations = donationData.map(donation => ({
        id: donation.id,
        date: new Date(donation.created_at).toLocaleDateString('en-US'),
        amount: donation.amount,
        cause: donation.campaigns?.title || 'Unknown Campaign',
        status: donation.status,
        receipt: donation.receipt_number,
        ngoDetails: ngoMap[donation.campaigns?.ngo_user_id] || {
          name: donation.campaigns?.ngo || 'Unknown Organization',
          registrationNumber: 'N/A',
          address: 'Address not available',
          city: '',
          state: '',
          postalCode: ''
        }
      }))

      totalDonated = donationData.reduce((sum, d) => sum + (d.amount || 0), 0)
      totalDonations = donationData.length
      lastDonation = donations.length > 0 ? donations[0].date : "No donations yet"

      // Calculate impact level based on total donated
      if (totalDonated >= 5000) impactLevel = "Platinum Supporter"
      else if (totalDonated >= 2000) impactLevel = "Gold Supporter"
      else if (totalDonated >= 1000) impactLevel = "Silver Supporter"
      else if (totalDonated >= 500) impactLevel = "Bronze Supporter"
      else if (totalDonated > 0) impactLevel = "Supporter"
    }
  } catch (error) {
    console.error('Error in donation data fetch:', error)
    // Continue with empty data if there's an error
  }
  
  // Map user data to donor profile structure
  const donorData = {
    name: name || "User",
    email: email || "No email provided",
    phone: "+1 (555) 123-4567", // TODO: This would need to be added to user metadata or separate table
    address: "Address not provided", // TODO: This would need to be added to user metadata or separate table
    memberSince: new Date(session.data.user.created_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    }),
    totalDonated,
    totalDonations,
    lastDonation,
    impactLevel,
    avatar_url: avatar_url,
    provider: app_metadata.provider,
    donationHistory: donations
  };

    return <DonorProfileClient donorData={donorData} />;
  } 