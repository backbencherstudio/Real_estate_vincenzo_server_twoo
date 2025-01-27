/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import Stripe from "stripe";
import nodemailer from "nodemailer";
import { Request, Response } from "express";
import config from "../../config";
import { User } from "../User/user.model";

// const stripe = new Stripe("sk_test_51Qj3DaLdWMYlebBQ7wPB3nTL52fvHLvxAeoagjEusGM5VuagX3FwNb0u7hl6A3xvJ5mvCuBZRlTq96BZXOl0N0WD00aH9Axh4r"); // client
const stripe = new Stripe("sk_test_51NFvq6ArRmO7hNaVBU6gVxCbaksurKb6Sspg6o8HePfktRB4OQY6kX5qqcQgfxnLnJ3w9k2EA0T569uYp8DEcfeq00KXKRmLUw"); //my 

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.sender_email,
    pass: config.email_pass,
  },
});

// const stripePayment = async (
//   req: { body: { email: string; amount: number; paymentMethodId: string } },
//   res: any
// ) => {
//   const { email, amount, paymentMethodId } = req.body;
//   if (!email || !amount || !paymentMethodId) {
//     return res.status(400).send({ error: "Email, amount, and payment method are required." });
//   }
//   try {
//     const customer = await stripe.customers.create({
//       email,
//       payment_method: paymentMethodId,
//       invoice_settings: {
//         default_payment_method: paymentMethodId,
//       },
//     });
//     const product = await stripe.products.create({
//       name: `Subscription for = ${email}`,
//     });
//     const price = await stripe.prices.create({
//       unit_amount: amount * 100,
//       currency: "usd",
//       recurring: { interval: "month" },
//       product: product.id,
//     });
//     const subscription = await stripe.subscriptions.create({
//       customer: customer.id,
//       items: [{ price: price.id }],
//       expand: ["latest_invoice.payment_intent"],
//     });

//     const latestInvoice = subscription.latest_invoice as Stripe.Invoice | null;
//     const customerId = subscription.customer as string;
//     const invoice_pdf = subscription.latest_invoice.invoice_pdf 


//     await User.findOneAndUpdate(
//       { email },
//       { $set: { customerId, invoice_pdf, subscriptionStatus: "active" } },
//       { new: true, runValidators: true }
//     );

//     res.status(200).send({
//       subscriptionId: subscription.id,
//       clientSecret: (latestInvoice?.payment_intent as Stripe.PaymentIntent)?.client_secret || null,
//       customer_id: customerId,
//       invoice_pdf,
//     });
//   } catch (error: any) {
//     console.error("Error creating subscription:", error);
//     res.status(500).send({ error: "Failed to create subscription." });
//   }
// };

const stripePayment = async (
  req: { body: { email: string; amount: number; paymentMethodId: string } },
  res: any
) => {
  const { email, amount, paymentMethodId } = req.body;

  if (!email || !amount || !paymentMethodId) {
    return res
      .status(400)
      .send({ error: "Email, amount, and payment method are required." });
  }

  try {
    let customer;
    try {
      customer = await stripe.customers.create({
        email,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    } catch (error: any) {
      console.error("Error creating customer:", error);
      return res.status(500).send({ error: "Failed to create customer." });
    }

    let product;
    try {
      product = await stripe.products.create({
        name: `Subscription for ${email}`,
      });
    } catch (error: any) {
      console.error("Error creating product:", error);
      return res.status(500).send({ error: "Failed to create product." });
    }

    
    let price;
    try {
      price = await stripe.prices.create({
        unit_amount: amount * 100,
        currency: "usd",
        recurring: { interval: "month" },
        product: product.id,
      });
    } catch (error: any) {
      console.error("Error creating price:", error);
      return res.status(500).send({ error: "Failed to create price." });
    }

    let subscription;
    try {
      subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: price.id }],
        expand: ["latest_invoice.payment_intent"],
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      return res.status(500).send({ error: "Failed to create subscription." });
    }

    const latestInvoice = subscription.latest_invoice as Stripe.Invoice | null;
    
    let invoice_pdf: string | undefined | null ;
    if (latestInvoice && typeof latestInvoice !== "string") {
      invoice_pdf = latestInvoice.invoice_pdf;
    } else if (typeof latestInvoice === "string") {
      try {
        const fetchedInvoice = await stripe.invoices.retrieve(latestInvoice);
        invoice_pdf = fetchedInvoice.invoice_pdf ?? undefined;
      } catch (error: any) {
        console.error("Error retrieving invoice:", error);
        invoice_pdf = undefined; 
      }
    }

    try {
      const customerId = subscription.customer as string;
      await User.findOneAndUpdate(
        { email },
        { $set: { customerId, invoice_pdf, subscriptionStatus: "active" } },
        { new: true, runValidators: true }
      );
    } catch (error: any) {
      console.error("Error updating user in database:", error);
      return res.status(500).send({ error: "Failed to update user in the database." });
    }

    res.status(200).send({
      subscriptionId: subscription.id,
      clientSecret: (latestInvoice?.payment_intent as Stripe.PaymentIntent)?.client_secret || null,
      customer_id: subscription.customer as string,
      invoice_pdf,
    });
  } catch (error: any) {
    console.error("Unexpected error:", error);
    res.status(500).send({ error: "An unexpected error occurred." });
  }
};


const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  try {
    await transporter.sendMail({
      from: config.sender_email,
      to,
      subject,
      text,
      html,
    });
    console.log(`Email sent to ${to} with subject "${subject}"`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
  }
};


const updateUserInDB = async (filter: object, update: object) => {
  try {
    await User.findOneAndUpdate(filter, { $set: update }, { new: true, runValidators: true });
    console.log(`Database updated for filter: ${JSON.stringify(filter)}`);
  } catch (error) {
    console.error(`Database update failed:`, error);
  }
};


const Webhook = async (req: Request, res: Response) => {
  const webhookSecret = "whsec_8ab581e0ee7aa6de572d6db241f16b3c253172564e802c2a15e5f6a741fcf397";
  const signature = req.headers["stripe-signature"];
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature!, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err}`);
    return res.status(400).send(`Webhook signature verification failed.`);
  }

  // Event handler mapping
  const eventHandlers: { [key: string]: (data: any) => Promise<void> } = {
    "invoice.upcoming": handleInvoiceUpcoming,
    "invoice.payment_failed": handlePaymentFailed,
    "customer.subscription.updated": handleSubscriptionUpdated,
    "subscription_schedule.canceled": handleSubscriptionCanceled,
    "invoice.finalized": handleInvoiceFinalized,
    "customer.subscription.deleted": handleSubscriptionDeleted,
  };

  const handler = eventHandlers[event.type];
  if (handler) {
    try {
      await handler(event.data.object);
    } catch (err) {
      console.error(`Error handling event ${event.type}:`, err);
      return res.status(500).send(`Error handling event.`);
    }
  } else {
    console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).send({ received: true });
};

// Handlers for specific events

const handleInvoiceUpcoming = async (invoice: Stripe.Invoice) => {
  const email = invoice.customer_email;
  const amountDue = invoice.amount_due / 100;
  if (email) {
    await sendEmail(
      email,
      "Upcoming Subscription Payment",
      `Your subscription renewal is coming up. The amount of $${amountDue} will be charged soon.`
    );
  }
};

const handlePaymentFailed = async (invoice: Stripe.Invoice) => {
  const email = invoice.customer_email;
  if (email) {
    await sendEmail(
      email,
      "Payment Failed",
      `Your payment of $${(invoice.amount_due / 100).toFixed(2)} for your subscription has failed. Please update your payment method.`
    );
  }
};

// const handleSubscriptionUpdated = async (subscription: Stripe.Subscription) => {
//   const status = subscription.status;
//   const customerId = subscription.customer as string;

//   const customer = await stripe.customers.retrieve(customerId);
//   if (!customer.deleted) {
//     const email = (customer as Stripe.Customer).email;
//     await updateUserInDB({ customerId }, { subscriptionStatus: status });
//     if (email) {
//       await sendEmail(email, "Subscription Updated", `Your subscription has been updated to status: ${status}.`);
//     }
//   }
// };


const handleSubscriptionUpdated = async (subscription: Stripe.Subscription) => {
  const status = subscription.status;
  const customerId = subscription.customer as string;

  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer.deleted) {
      const email = (customer as Stripe.Customer).email;

      const latestInvoice = subscription.latest_invoice as string | Stripe.Invoice | null;
      let invoice_pdf: string | undefined;

      if (latestInvoice && typeof latestInvoice !== "string") {
        invoice_pdf = latestInvoice.invoice_pdf ?? undefined;
      } else if (typeof latestInvoice === "string") {
        const fetchedInvoice = await stripe.invoices.retrieve(latestInvoice);
        invoice_pdf = fetchedInvoice.invoice_pdf ?? undefined;
      }
      const updateData: { subscriptionStatus: string; invoicePdfUrl?: string } = { subscriptionStatus: status };
      if (invoice_pdf) {
        updateData.invoicePdfUrl = invoice_pdf;
      }
      await updateUserInDB({ customerId }, updateData);
      if (email) {
        const emailContent = `
          <p>Your subscription has been updated to status: <strong>${status}</strong>.</p>
          ${
            invoice_pdf
              ? `<p>You can view your latest invoice <a href="${invoice_pdf}" target="_blank">here</a>.</p>`
              : `<p>No invoice is available at the moment.</p>`
          }
        `;

        await sendEmail(email, "Subscription Updated", `Your subscription status is now ${status}.`, emailContent);
        console.log(`Subscription update email sent to ${email}`);
      }
    }
  } catch (error) {
    console.error(`Error handling subscription update for customerId: ${customerId}`, error);
  }
};



const handleSubscriptionCanceled = async (schedule: Stripe.SubscriptionSchedule) => {
  const status = schedule.status;
  const customerId = schedule.customer as string;
  const customer = await stripe.customers.retrieve(customerId);
  if (!customer.deleted) {
    const email = (customer as Stripe.Customer).email;
    await updateUserInDB({ customerId }, { subscriptionStatus: status });
    if (email) {
      await sendEmail(
        email,
        "Subscription Canceled",
        `Your subscription has been canceled. If you wish to subscribe again, please contact us.`
      );
    }
  }
};

const handleInvoiceFinalized = async (invoice: Stripe.Invoice) => {
  const email = invoice.customer_email;
  const pdfUrl = invoice.invoice_pdf;
  const total = invoice.amount_due / 100;
  const customerId = invoice.customer as string;

  await updateUserInDB({ email }, { customerId, invoice_pdf : pdfUrl, subscriptionStatus: "active" });

  if (email) {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fafafa; border: 1px solid #ddd;">
          <h2 style="color: #333; margin-bottom: 16px;">Invoice Finalized</h2>
          <p style="color: #555; font-size: 15px; line-height: 1.5;">
            Hello,<br><br>
            Your invoice is finalized. The total amount is 
            <strong style="font-size: 16px; color: #000;">
              $${total.toFixed(2)}
            </strong>.
          </p>
          <p style="color: #555; font-size: 15px; line-height: 1.5;">
            You can view or download your invoice using the link below:
          </p>
          <p>
            <a href="${pdfUrl}" style="display: inline-block; margin-top: 10px; padding: 10px 20px; background-color: #0d6efd; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Download Invoice PDF
            </a>
          </p>
          <p style="color: #555; font-size: 15px; margin-top: 20px; line-height: 1.5;">
            Thank you!<br>
            <em>The Team</em>
          </p>
        </div>
      `;

    try {
      await sendEmail(
        email,
        "Your Invoice is Finalized",
        `Hello, Your invoice for $${total.toFixed(2)} is finalized. Download your invoice here: ${pdfUrl}`, // Fallback plain-text version
        htmlContent
      );
      console.log(`Finalized invoice email sent to ${email}`);
    } catch (error) {
      console.error(`Failed to send finalized invoice email to ${email}:`, error);
    }
  }
};


const handleSubscriptionDeleted = async (subscription: Stripe.Subscription) => {
  const customerId = subscription.customer as string;

  await updateUserInDB({ customerId }, { subscriptionStatus: "canceled" });
  console.log(`Subscription deleted for customerId: ${customerId}`);
};





export const stripePaymentService = {
  stripePayment,
  Webhook,
};
