import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { 
      campaignId, 
      amount, 
      tipPercentage, 
      isRecurring, 
      recurringInterval,
      campaignTitle,
      ngoName 
    } = body

    if (!campaignId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid donation parameters' },
        { status: 400 }
      )
    }

    // Get user session for metadata
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const baseAmount = Math.round(amount / (1 + tipPercentage / 100))
    const tipAmount = amount - baseAmount

    // Create line items
    const lineItems = [
      {
        price_data: {
          currency: 'myr', // Malaysian Ringgit
          unit_amount: baseAmount,
          product_data: {
            name: `Donation to ${campaignTitle}`,
            description: `Supporting ${ngoName}'s campaign`,
            images: [], // Could add campaign image here
          },
        },
        quantity: 1,
      }
    ]

    // Add tip as separate line item if applicable
    if (tipAmount > 0) {
      lineItems.push({
        price_data: {
          currency: 'myr',
          unit_amount: tipAmount,
          product_data: {
            name: 'Platform Tip',
            description: `Tip to support Relief Connect platform (${tipPercentage}%)`,
          },
        },
        quantity: 1,
      })
    }

    const sessionParams = {
      payment_method_types: ['card'],
      mode: isRecurring ? 'subscription' : 'payment',
      currency: 'myr',
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/donation/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/donate?campaign=${campaignId}`,
      metadata: {
        campaignId,
        donorId: user?.id || 'anonymous',
        tipPercentage: tipPercentage.toString(),
        isRecurring: isRecurring.toString(),
        recurringInterval: recurringInterval || 'monthly',
        campaignTitle,
        ngoName
      },
      customer_email: user?.email,
    }

    // Handle recurring donations
    if (isRecurring) {
      // For recurring donations, we need to create a price for the subscription
      const price = await stripe.prices.create({
        currency: 'myr',
        unit_amount: amount,
        product_data: {
          name: `Recurring Donation to ${campaignTitle}`,
          description: `Monthly support for ${ngoName}'s campaign`,
        },
        recurring: {
          interval: recurringInterval === 'quarterly' ? 'month' : recurringInterval,
          interval_count: recurringInterval === 'quarterly' ? 3 : 1,
        },
      })

      sessionParams.line_items = [{
        price: price.id,
        quantity: 1,
      }]
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
