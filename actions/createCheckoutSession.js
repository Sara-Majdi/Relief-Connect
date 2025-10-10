'use server'
//runs on the server instead of the browser (client)

import products from '@/app/products'
import { stripe } from '@/lib/stripe'
import { redirect } from 'next/navigation'


/**
 * @param {Object} params - THe parameters for creating the checkout session.
 * @param {imort('stripe').Stripe.Checkout.SessionCreateParams.UiMode} params.ui_mode - The UI mode for the checkout session ('embedded' or 'redirect').
 * @returns {Promise<void>} - A promise that resolves when the checkout session is created
 */


export async function createCheckoutSession({ ui_mode = 'hosted'}) {
    
    /**
     * @type {import('stripe').Stripe.Checkout.SessionCreateParams}
     */
    const sessionParams = {
        payment_method_types: ['card'],
        mode: 'payment',
        currency: 'usd',
        ui_mode,
        line_items: products.map(product => ({
            price_data: {
                currency: 'usd',
                unit_amount: product.price,
                product_data: {
                    name: product.name,
                    description: product.description,
                    images: [product.image],
                },
            },
            quantity: product.quantity,
        })),
    }

    if (ui_mode === 'hosted') {
        sessionParams.success_url = "http:localhost:300/success"
        sessionParams.cancel_url = "http:localhost:300/cancel"
    } else {
        // For embedded customs mode, we dont set succes and cancel URLs
        sessionParams.return_url = "http:localhost:300/success"
    }


    const session = await stripe.checkout.sessions.create(sessionParams)

    console.log("Checkout ssession created:", session)

    if(session.url){
        // Redirect to the Stripe Checkout page if in hosted mode
        redirect(session.url)
    }
}