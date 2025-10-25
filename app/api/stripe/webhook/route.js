import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    
    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 })
    }

    let event
    
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('Stripe webhook received:', event.type)

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      
      console.log('Processing completed checkout session:', session.id)
      
      // Extract donation data from session metadata
      const {
        campaignId,
        donorId,
        donorName,
        donorEmail,
        tipPercentage,
        isRecurring,
        recurringInterval,
        campaignTitle,
        ngoName
      } = session.metadata

      if (!campaignId || !campaignTitle || !ngoName) {
        console.error('Missing required metadata in completed session')
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
      }

      // Calculate amounts
      const totalAmount = session.amount_total / 100
      const tipAmount = tipPercentage ? totalAmount * (parseInt(tipPercentage) / 100) : 0
      const baseAmount = totalAmount - tipAmount

      // Generate receipt number
      const receiptNumber = `RC-${new Date().getFullYear()}-${session.id.slice(-8).toUpperCase()}`

      // Insert donation into database
      const supabase = await createClient()
      
      const donationRecord = {
        id: session.id,
        campaign_id: campaignId,
        donor_id: donorId,
        amount: baseAmount,
        tip_amount: tipAmount,
        total_amount: totalAmount,
        is_recurring: isRecurring === 'true',
        recurring_interval: recurringInterval || 'monthly',
        receipt_number: receiptNumber,
        status: 'completed',
        stripe_session_id: session.id,
        donor_name: donorName || 'Anonymous Donor',
        donor_email: donorEmail || session.customer_email,
        created_at: new Date().toISOString()
      }

      console.log('Inserting donation from webhook:', donationRecord)

      const { data: insertData, error: insertError } = await supabase
        .from('donations')
        .insert(donationRecord)
        .select()

      if (insertError) {
        console.error('Error inserting donation from webhook:', insertError)
        return NextResponse.json({ error: 'Database insert failed' }, { status: 500 })
      }

      console.log('Donation successfully inserted from webhook:', insertData)
      console.log('Campaign will be updated automatically by database trigger')
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
