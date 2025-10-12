import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test if donations table exists and is accessible
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .limit(1)

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Donations table is accessible',
      count: data?.length || 0,
      sample: data?.[0] || null
    })
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err.message
    })
  }
}

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Test inserting a sample donation record
    const testDonation = {
      id: 'test-' + Date.now(),
      campaign_id: 'test-campaign',
      donor_id: 'test-donor',
      amount: 100.00,
      tip_amount: 10.00,
      total_amount: 110.00,
      is_recurring: false,
      recurring_interval: 'monthly',
      receipt_number: 'TEST-' + Date.now(),
      status: 'completed',
      stripe_session_id: 'test-session',
      donor_name: 'Test Donor',
      donor_email: 'test@example.com'
    }

    const { data, error } = await supabase
      .from('donations')
      .insert(testDonation)
      .select()

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Test donation inserted successfully',
      data: data?.[0] || null
    })
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err.message
    })
  }
}
