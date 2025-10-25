import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function GET(request, { params }) {
  try {
    const { sessionId } = params

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer']
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Extract donation data from session metadata
    const {
      campaignId,
      donorId,
      donorName: metadataDonorName,
      donorEmail: metadataDonorEmail,
      tipPercentage,
      isRecurring,
      recurringInterval,
      campaignTitle,
      ngoName
    } = session.metadata

    // Validate required metadata
    if (!campaignId || !campaignTitle || !ngoName) {
      console.error('Missing required metadata:', { campaignId, campaignTitle, ngoName })
      return NextResponse.json(
        { error: 'Incomplete donation metadata' },
        { status: 400 }
      )
    }

    // Calculate amounts
    const totalAmount = session.amount_total / 100 // Convert from cents
    const tipAmount = tipPercentage ? totalAmount * (parseInt(tipPercentage) / 100) : 0
    const baseAmount = totalAmount - tipAmount

    // Generate receipt number
    const receiptNumber = `RC-${new Date().getFullYear()}-${sessionId.slice(-8).toUpperCase()}`

    // Get donor information - prefer metadata, fallback to current session
    const supabase = await createClient()
    let donorName = metadataDonorName || 'Anonymous Donor'
    let donorEmail = metadataDonorEmail || session.customer_email
    let currentUser = null

    // If we have donor info from metadata, use it; otherwise try to get current user
    if (!metadataDonorName && donorId && donorId !== 'anonymous') {
      const { data: user } = await supabase.auth.getUser()
      currentUser = user?.user
      if (currentUser) {
        donorName = currentUser.user_metadata?.name || 'Anonymous Donor'
        donorEmail = currentUser.email || session.customer_email
      }
    }

    console.log('Donor info:', { donorName, donorEmail, donorId, currentUser: !!currentUser })

    // Create donation record in database
    try {
      const donationRecord = {
        id: sessionId,
        campaign_id: campaignId,
        donor_id: currentUser?.id || donorId,
        amount: baseAmount,
        tip_amount: tipAmount,
        total_amount: totalAmount,
        is_recurring: isRecurring === 'true',
        recurring_interval: recurringInterval,
        receipt_number: receiptNumber,
        status: 'completed',
        stripe_session_id: sessionId,
        donor_name: donorName,
        donor_email: donorEmail,
        created_at: new Date().toISOString()
      }

      console.log('Inserting donation record:', donationRecord)

      const { data: insertData, error: insertError } = await supabase
        .from('donations')
        .insert(donationRecord)
        .select()

      if (insertError) {
        console.error('Error inserting donation:', insertError)
        console.error('Donation record that failed:', donationRecord)
        // Don't fail the request if database insert fails, but log the error
      } else {
        console.log('Donation successfully inserted:', insertData)
        console.log('Campaign will be updated automatically by database trigger')
      }
    } catch (dbError) {
      console.error('Database error:', dbError)
      // Continue with response even if database insert fails
    }

    const responseData = {
      donationId: sessionId,
      campaignId,
      campaignTitle,
      ngoName,
      amount: baseAmount,
      tipAmount,
      totalAmount,
      isRecurring: isRecurring === 'true',
      recurringInterval,
      receiptNumber,
      donorName,
      donorEmail,
      status: 'completed',
      createdAt: new Date().toISOString()
    }

    console.log('Returning donation data:', responseData)
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error fetching donation session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch donation details' },
      { status: 500 }
    )
  }
}
