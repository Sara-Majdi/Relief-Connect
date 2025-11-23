import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Verify this is a campaign creation payment
    if (session.metadata?.type !== 'campaign_creation_fee') {
      return NextResponse.json(
        { error: 'Invalid payment type' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      ngoUserId: session.metadata.ngo_user_id,
      ngoName: session.metadata.ngo_name,
      amountPaid: session.amount_total / 100, // Convert from cents
      currency: session.currency.toUpperCase(),
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
