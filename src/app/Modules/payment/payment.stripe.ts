/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import Stripe from "stripe";
import nodemailer from "nodemailer";
import { Request, Response } from "express";
import config from "../../config";

// const stripe = new Stripe("sk_test_51Qj3DaLdWMYlebBQ7wPB3nTL52fvHLvxAeoagjEusGM5VuagX3FwNb0u7hl6A3xvJ5mvCuBZRlTq96BZXOl0N0WD00aH9Axh4r"); // client
const stripe = new Stripe("sk_test_51NFvq6ArRmO7hNaVBU6gVxCbaksurKb6Sspg6o8HePfktRB4OQY6kX5qqcQgfxnLnJ3w9k2EA0T569uYp8DEcfeq00KXKRmLUw"); //my 

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: config.sender_email,
        pass: config.email_pass,
    },
});

const stripePayment = async (
    req: { body: { email: string; amount: number; paymentMethodId: string } },
    res: any
) => {
    const { email, amount, paymentMethodId } = req.body;
    if (!email || !amount || !paymentMethodId) {
        return res.status(400).send({ error: "Email, amount, and payment method are required." });
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
            currency: "usd",
            recurring: { interval: "month" },
            product: product.id,
        });
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: price.id }],
            expand: ["latest_invoice.payment_intent"],
        });

        const latestInvoice = subscription.latest_invoice as Stripe.Invoice | null;
        const invoicePdf = latestInvoice?.invoice_pdf || null;
        const hostedInvoiceUrl = latestInvoice?.hosted_invoice_url || null;
        const customerId = subscription.customer as string;

        res.status(200).send({
            subscriptionId: subscription.id,
            clientSecret: (latestInvoice?.payment_intent as Stripe.PaymentIntent)?.client_secret || null,
            customer_id: customerId,
            invoicePdf,
            hostedInvoiceUrl,
        });
    } catch (error: any) {
        console.error("Error creating subscription:", error);
        res.status(500).send({ error: "Failed to create subscription." });
    }
};


const Webhook = async (req: Request, res: Response) => {
    const webhookSecret =
        "whsec_8ab581e0ee7aa6de572d6db241f16b3c253172564e802c2a15e5f6a741fcf397";
    const signature = req.headers["stripe-signature"];
    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(req.body, signature!, webhookSecret);
    } catch (err: any) {
        return res.status(400).send(`Webhook error: ${err.message}`);
    }

    switch (event.type) {
        case "invoice.upcoming": {
            const invoice = event.data.object as Stripe.Invoice;
            const email = invoice.customer_email;
            const amountDue = invoice.amount_due / 100;
            if (email) {
                await transporter.sendMail({
                    from: config.sender_email,
                    to: email,
                    subject: "Upcoming Subscription Payment",
                    text: `Your subscription renewal is coming up in 2 days. The amount of $${amountDue} will be charged to your account.`,
                });
            }
            break;
        }
        case "invoice.payment_failed": {
            const failedInvoice = event.data.object as Stripe.Invoice;
            const failedEmail = failedInvoice.customer_email;
            if (failedEmail) {
                await transporter.sendMail({
                    from: config.sender_email,
                    to: failedEmail,
                    subject: "Payment Failed",
                    text: `Your payment of $${failedInvoice.amount_due / 100} for your subscription has failed. Please update your payment method.`,
                });
            }
            break;
        }

        case "customer.subscription.updated": {
            const subscription = event.data.object as Stripe.Subscription;
            const updatedEmail = subscription?.customer_email as string;
            if (updatedEmail) {
                await transporter.sendMail({
                    from: config.sender_email,
                    to: updatedEmail,
                    subject: "Subscription Updated",
                    text: `Your subscription has been updated. Please review the changes.`,
                });
            }
            break;
        }
        case "subscription_schedule.canceled": {
            const schedule = event.data.object as Stripe.SubscriptionSchedule;
            if (typeof schedule.customer === "string") {
                const customer = await stripe.customers.retrieve(schedule.customer);
                if (!customer.deleted) {
                    const customerEmail = customer.email;
                    if (customerEmail) {
                        await transporter.sendMail({
                            from: config.sender_email,
                            to: customerEmail,
                            subject: "Subscription Canceled",
                            text: `Hello,
          
          Your subscription has been canceled successfully. If you have any questions or would like to subscribe again in the future, please let us know.
          
          Thank you,
          The Team`,
                        });
                        console.log(`Subscription canceled email sent to ${customerEmail}`);
                    } else {
                        console.log(`No email found for customer ${schedule.customer}.`);
                    }
                } else {
                    console.log(`Customer ${schedule.customer} is deleted; no email available.`);
                }
            } else {
                const customerObj = schedule.customer as Stripe.Customer;
                const customerEmail = customerObj.email;
                if (customerEmail) {
                    await transporter.sendMail({
                        from: config.sender_email,
                        to: customerEmail,
                        subject: "Subscription Canceled",
                        text: `Hello,
          
          Your subscription has been canceled successfully. If you have any questions or would like to subscribe again in the future, please let us know.
          
          Thank you,
          The Team`,
                    });
                    console.log(`Subscription canceled email sent to ${customerEmail}`);
                } else {
                    console.log(`No email found in expanded customer object.`);
                }
            }
            break;
        }

        case "invoice.finalized": {
            const finalizedInvoice = event.data.object as Stripe.Invoice;
            const finalizedEmail = finalizedInvoice.customer_email;
            const pdfUrl = finalizedInvoice.invoice_pdf;
            const total = (finalizedInvoice.amount_due ?? 0) / 100;
            if (finalizedEmail) {
                await transporter.sendMail({
                    from: config.sender_email,
                    to: finalizedEmail,
                    subject: "Your Invoice is Finalized",
                    text: `Hello,
  
  Your invoice (ID: ${finalizedInvoice.id}) for $${total.toFixed(
                        2
                    )} is finalized. 
  You can view or download it here: ${pdfUrl}
  
  Thank you!`,

                    html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #fafafa;
          border: 1px solid #ddd;
          border-radius: 8px;
        ">
          <h2 style="color: #333; margin-bottom: 16px;">Invoice Finalized</h2>
          <p style="color: #555; font-size: 15px; line-height: 1.5;">
            Hello,<br><br>
            Your invoice 
            <strong>(ID: ${finalizedInvoice.id})</strong>
            for 
            <strong style="font-size: 16px; color: #000;">
              $${total.toFixed(2)}
            </strong> 
            is now finalized.
          </p>
          <p style="color: #555; font-size: 15px; line-height: 1.5;">
            You can view or download a PDF of your invoice by clicking the button below:
          </p>
          <a
            href="${pdfUrl}"
            style="
              display: inline-block;
              margin-top: 10px;
              padding: 10px 20px;
              background-color: #0d6efd;
              color: #fff;
              text-decoration: none;
              border-radius: 4px;
              font-weight: bold;
            "
          >
            Download Invoice PDF
          </a>
          <p style="color: #555; font-size: 15px; margin-top: 20px; line-height: 1.5;">
            Thank you!<br>
            <em>The Team</em>
          </p>
        </div>
        `,
                });

                console.log(`Finalized invoice email sent to ${finalizedEmail}`);
            }
            break;
        }


        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).send({ received: true });
};


export const stripePaymentService = {
    stripePayment,
    Webhook,
};
