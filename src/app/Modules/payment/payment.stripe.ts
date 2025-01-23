/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-unused-vars

import Stripe from "stripe";

const stripe = new Stripe('sk_test_51Qj3DaLdWMYlebBQ7wPB3nTL52fvHLvxAeoagjEusGM5VuagX3FwNb0u7hl6A3xvJ5mvCuBZRlTq96BZXOl0N0WD00aH9Axh4r');


const stripePayment = async (req: { body: { email: any; amount: any; paymentMethodId: any }; }, res: any) => {
    const { email, amount, paymentMethodId } = req.body;

    if (!email || !amount || !paymentMethodId) {
        return res.status(400).send({ error: 'Email, amount, and payment method are required.' });
    }

    try {
        const customer = await stripe.customers.create({
            email,
            payment_method: paymentMethodId,
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });

        const product = await stripe.products.create({
            name: `Subscription for = ${email}`,
        });

        const price = await stripe.prices.create({
            unit_amount: amount * 100,
            currency: 'usd',
            recurring: { interval: 'month' },
            product: product.id,
        });

        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: price.id }],
            expand: ['latest_invoice.payment_intent'],
        });

        const invoice = subscription?.latest_invoice.invoice_pdf
        const hosted_invoice = subscription?.latest_invoice.hosted_invoice_url
        const customer_id = subscription.customer


        res.status(200).send({
            subscriptionId: subscription.id,
            clientSecret: subscription?.latest_invoice.payment_intent.client_secret,
            customer_id,
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).send({ error: 'Failed to create subscription.' });
    }

}









export const stripePaymentService = {
    stripePayment
}