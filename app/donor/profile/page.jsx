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
    totalDonated: 2840, // TODO : Will come from donation table
    totalDonations: 15, // TODO : Will come from donation table
    lastDonation: "March 15, 2024", // TODO : Will come from donation table
    impactLevel: "Gold Supporter", // TODO : Will be calculated based on donation amounts
    avatar_url: avatar_url,
    provider: app_metadata.provider,
    donationHistory: [
      // TODO : Will come from donation table
      { id: 1, date: "2024-03-15", amount: 250, cause: "Education Fund", status: "completed", receipt: "RC-2024-0315" },
      { id: 2, date: "2024-02-14", amount: 100, cause: "Valentine's Day Campaign", status: "completed", receipt: "RC-2024-0214" },
      { id: 3, date: "2024-01-20", amount: 200, cause: "Emergency Relief", status: "completed", receipt: "RC-2024-0120" },
      { id: 4, date: "2023-12-25", amount: 500, cause: "Holiday Giving", status: "completed", receipt: "RC-2023-1225" },
      { id: 5, date: "2023-11-15", amount: 150, cause: "Community Garden", status: "completed", receipt: "RC-2023-1115" },
      { id: 6, date: "2023-10-10", amount: 300, cause: "Youth Programs", status: "completed", receipt: "RC-2023-1010" },
      { id: 7, date: "2023-09-05", amount: 75, cause: "Animal Shelter", status: "completed", receipt: "RC-2023-0905" },
      { id: 8, date: "2023-08-12", amount: 400, cause: "Scholarship Fund", status: "completed", receipt: "RC-2023-0812" }
    ]
  };

    return <DonorProfileClient donorData={donorData} />;
  } 