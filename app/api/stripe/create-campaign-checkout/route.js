import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { ngoUserId, ngoName, ngoEmail } = await request.json();

    if (!ngoUserId || !ngoName || !ngoEmail) {
      return NextResponse.json(
        { error: 'Missing required information' },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'fpx'],
      line_items: [
        {
          price_data: {
            currency: 'myr',
            product_data: {
              name: 'Campaign Creation Fee',
              description: 'One-time fee to create a new disaster relief campaign on ReliefConnect',
              images: [],
            },
            unit_amount: 1000, // RM 10.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.SITE_URL}/ngo/campaigns/create/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL}/ngo/campaigns/create/payment?cancelled=true`,
      client_reference_id: ngoUserId,
      customer_email: ngoEmail,
      metadata: {
        type: 'campaign_creation_fee',
        ngo_user_id: ngoUserId,
        ngo_name: ngoName,
        ngo_email: ngoEmail,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
