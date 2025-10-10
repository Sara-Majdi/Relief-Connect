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
      tipPercentage,
      isRecurring,
      recurringInterval,
      campaignTitle,
      ngoName
    } = session.metadata

    // Calculate amounts
    const totalAmount = session.amount_total / 100 // Convert from cents
    const tipAmount = tipPercentage ? totalAmount * (parseInt(tipPercentage) / 100) : 0
    const baseAmount = totalAmount - tipAmount

    // Generate receipt number
    const receiptNumber = `RC-${new Date().getFullYear()}-${sessionId.slice(-8).toUpperCase()}`

    // Get donor information
    const supabase = await createClient()
    let donorName = 'Anonymous Donor'
    let donorEmail = session.customer_email

    if (donorId && donorId !== 'anonymous') {
      const { data: user } = await supabase.auth.getUser()
      if (user?.user) {
        donorName = user.user.user_metadata?.name || 'Anonymous Donor'
        donorEmail = user.user.email || session.customer_email
      }
    }

    // Create donation record in database
    try {
      const { error: insertError } = await supabase
        .from('donations')
        .insert({
          id: sessionId,
          campaign_id: campaignId,
          donor_id: user?.id,
          amount: baseAmount,
          tip_amount: tipAmount,
          total_amount: totalAmount,
          is_recurring: isRecurring === 'true',
          recurring_interval: recurringInterval,
          receipt_number: receiptNumber,
          status: 'completed',
          stripe_session_id: sessionId,
          created_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Error inserting donation:', insertError)
        // Don't fail the request if database insert fails
      }
    } catch (dbError) {
      console.error('Database error:', dbError)
      // Continue with response even if database insert fails
    }

    return NextResponse.json({
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
    })
  } catch (error) {
    console.error('Error fetching donation session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch donation details' },
      { status: 500 }
    )
  }
}
