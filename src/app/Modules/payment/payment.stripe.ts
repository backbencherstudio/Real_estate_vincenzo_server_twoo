/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import Stripe from "stripe";
import nodemailer from "nodemailer";
import { Request, Response } from "express";
import config from "../../config";
import { User } from "../User/user.model";
import { TenantPayment } from "./payment.module";

const stripe = new Stripe(
  "sk_test_51NFvq6ArRmO7hNaVBU6gVxCbaksurKb6Sspg6o8HePfktRB4OQY6kX5qqcQgfxnLnJ3w9k2EA0T569uYp8DEcfeq00KXKRmLUw"
);

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
//     return res
//       .status(400)
//       .send({ error: "Email, amount, and payment method are required." });
//   }

//   try {
//     let customer;
//     try {
//       customer = await stripe.customers.create({
//         email,
//         payment_method: paymentMethodId,
//         invoice_settings: {
//           default_payment_method: paymentMethodId,
//         },
//       });
//     } catch (error: any) {
//       console.error("Error creating customer:", error);
//       return res.status(500).send({ error: "Failed to create customer." });
//     }

//     let product;
//     try {
//       product = await stripe.products.create({
//         name: `Subscription for ${email}`,
//       });
//     } catch (error: any) {
//       console.error("Error creating product:", error);
//       return res.status(500).send({ error: "Failed to create product." });
//     }

//     let price;
//     try {
//       price = await stripe.prices.create({
//         unit_amount: amount * 100,
//         currency: "usd",
//         recurring: { interval: "day" },
//         // recurring: { interval: "month" },
//         product: product.id,
//       });
//     } catch (error: any) {
//       console.error("Error creating price:", error);
//       return res.status(500).send({ error: "Failed to create price." });
//     }

//     let subscription;
//     try {
//       subscription = await stripe.subscriptions.create({
//         customer: customer.id,
//         items: [{ price: price.id }],
//         expand: ["latest_invoice.payment_intent"],
//       });
//     } catch (error: any) {
//       console.error("Error creating subscription:", error);
//       return res.status(500).send({ error: "Failed to create subscription." });
//     }

//     const latestInvoice = subscription.latest_invoice as Stripe.Invoice | null;
//     let invoice_pdf: string | undefined | null;
//     if (latestInvoice && typeof latestInvoice !== "string") {
//       invoice_pdf = latestInvoice.invoice_pdf;
//     } else if (typeof latestInvoice === "string") {
//       try {
//         const fetchedInvoice = await stripe.invoices.retrieve(latestInvoice);
//         invoice_pdf = fetchedInvoice.invoice_pdf ?? undefined;
//       } catch (error: any) {
//         console.error("Error retrieving invoice:", error);
//         invoice_pdf = undefined;
//       }
//     }

//     try {
//       const customerId = subscription.customer as string;
//       await User.findOneAndUpdate(
//         { email },
//         { $set: { customerId, invoice_pdf, subscriptionStatus: "active" } },
//         { new: true, runValidators: true }
//       );
//     } catch (error: any) {
//       console.error("Error updating user in database:", error);
//       return res
//         .status(500)
//         .send({ error: "Failed to update user in the database." });
//     }

//     res.status(200).send({
//       subscriptionId: subscription.id,
//       clientSecret: (latestInvoice?.payment_intent as Stripe.PaymentIntent)
//         ?.client_secret || null,
//       customer_id: subscription.customer as string,
//       invoice_pdf,
//     });
//   } catch (error: any) {
//     console.error("Unexpected error:", error);
//     res.status(500).send({ error: "An unexpected error occurred." });
//   }
// };


const stripePayment = async (
  req: { body: { email: string; amount: number; paymentMethodId: string; getTotalUnit: number } },
  res: any
) => {
  const { email, amount, paymentMethodId, getTotalUnit } = req.body;

  if (!email || !amount || !paymentMethodId) {
    return res.status(400).send({
      error: "Email, amount, and payment method are required.",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ error: "User not found." });
    }

    if (user.customerId) {
      const subscriptions = await stripe.subscriptions.list({
        customer: user.customerId,
        status: "active",
      });

      for (const subscription of subscriptions.data) {
        await stripe.subscriptions.update(subscription.id, {
          cancel_at_period_end: true,
        });
        console.log(`Marked subscription ${subscription.id} for cancellation at period end for user ${email}`);
      }
    }

    let customerId = user.customerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      customerId = customer.id;
    }

    const product = await stripe.products.create({
      name: `Subscription for ${email}`,
    });

    const price = await stripe.prices.create({
      unit_amount: amount * 100,
      currency: "usd",
      recurring: { interval: "month" },
      product: product.id,
    });

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: price.id }],
      expand: ["latest_invoice.payment_intent"],
    });

    const latestInvoice = subscription.latest_invoice as Stripe.Invoice | null;
    const invoicePdf =
      latestInvoice && typeof latestInvoice !== "string"
        ? latestInvoice.invoice_pdf
        : null;

    await User.findOneAndUpdate(
      { email },
      {
        $set: {
          customerId,
          subscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          invoice_pdf: invoicePdf,
          getTotalUnit
        },
      },
      { new: true, runValidators: true }
    );

    res.status(200).send({
      subscriptionId: subscription.id,
      clientSecret: (latestInvoice?.payment_intent as Stripe.PaymentIntent)?.client_secret || null,
      customer_id: customerId,
      invoicePdf,
    });
  } catch (error: any) {
    console.error("Error creating subscription:", error);
    res.status(500).send({ error: "Failed to create subscription." });
  }
};



const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string
) => {
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


const cancelSubscription = async (req: Request, res: Response) => {
  const { customerId } = req.params;

  try {
    const user = await User.findOne({ customerId });
    if (!user || !user.customerId) {
      return res.status(404).json({ error: "User or subscription not found." });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: user.customerId,
      status: "active",
    });

    if (subscriptions.data.length === 0) {
      return res.status(404).json({ error: "No active subscription found." });
    }

    const subscriptionId = subscriptions.data[0].id;

    const canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    const textContent = `
      Hello,

      Your subscription has been successfully set to cancel at the end of the current billing period. If you have any questions or wish to resubscribe, please feel free to contact us.

      Thank you for being with us,
      – The Team
    `;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #f44336; color: #ffffff; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Subscription Set to Cancel</h1>
        </div>
        <div style="padding: 20px;">
          <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hello,
          </p>
          <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Your subscription has been successfully set to <strong>cancel</strong> at the end of the current billing period.
          </p>
          <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            If you have any questions or wish to resubscribe in the future, please feel free to contact us at any time.
          </p>
          <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Thank you for being with us,
          </p>
          <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px; font-weight: bold;">
            – The Team
          </p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #888888;">
          <p style="margin: 0;">
            If you have any questions, feel free to <a href="mailto:support@example.com" style="color: #0d6efd; text-decoration: none;">contact us</a>.
          </p>
          <p style="margin: 10px 0 0;">&copy; ${new Date().getFullYear()} The Team. All rights reserved.</p>
        </div>
      </div>
    `;

    await sendEmail(
      user.email,
      "Subscription Set to Cancel",
      textContent,
      htmlContent
    );

    console.log(`Subscription set to cancel at period end for user: ${user.email}`);
    res.status(200).json({
      message: "Subscription successfully set to cancel at the end of the current billing period.",
      subscriptionId: canceledSubscription.id,
    });
  } catch (error: any) {
    console.error("Error canceling subscription:", error);
    res.status(500).json({ error: "Failed to cancel subscription." });
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

  // charge.updated

  const eventHandlers: { [key: string]: (data: any) => Promise<void> } = {
    "invoice.upcoming": handleInvoiceUpcoming,
    "invoice.payment_failed": handlePaymentFailed,
    "customer.subscription.updated": handleSubscriptionUpdated,
    "subscription_schedule.canceled": handleSubscriptionCanceled,
    "invoice.finalized": handleInvoiceFinalized,
    "customer.subscription.deleted": handleSubscriptionDeleted,
    "invoice.payment_succeeded": handleInvoicePaymentSucceeded,
    "charge.updated": handleChargeUpdated,
  };

  //   payment_intent.succeeded
  // payment_intent.payment_failed


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

const handleInvoiceUpcoming = async (invoice: Stripe.Invoice) => {
  const email = invoice.customer_email;
  const amountDue = invoice.amount_due / 100;
  if (email) {
    await sendEmail(
      email,
      "Upcoming Subscription Payment",
      `Your subscription renewal is coming up soon. The amount of $${amountDue.toFixed(
        2
      )} will be charged soon.`
    );
  }
};

const handlePaymentFailed = async (invoice: Stripe.Invoice) => {
  const email = invoice.customer_email;
  const subscriptionId = invoice.subscription as string | null;
  let subscriptionStatus = "canceled";
  if (subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      subscriptionStatus = subscription.status;
    } catch (error) {
      console.error(
        `Error retrieving subscription status for subscription ID: ${subscriptionId}`,
        error
      );
    }
  }
  try {
    await updateUserInDB({ email }, { subscriptionStatus });
  } catch (error) {
    console.error(`Error updating user in database for email: ${email}`, error);
  }
  if (email) {
    const amountDue = (invoice.amount_due / 100).toFixed(2);
    try {
      await sendEmail(
        email,
        "Payment Failed",
        `Your payment of $${amountDue} for your subscription has failed. Please update your payment method.`
      );
      console.log(`Payment failed email sent to ${email}`);
    } catch (error) {
      console.error(`Error sending email to ${email}`, error);
    }
  }
};

const handleSubscriptionUpdated = async (subscription: Stripe.Subscription) => {
  const status = subscription.status;
  const customerId = subscription.customer as string;

  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer.deleted) {
      const email = (customer as Stripe.Customer).email;

      const latestInvoice = subscription.latest_invoice as
        | string
        | Stripe.Invoice
        | null;
      let invoice_pdf: string | undefined;

      if (latestInvoice && typeof latestInvoice !== "string") {
        invoice_pdf = latestInvoice.invoice_pdf ?? undefined;
      } else if (typeof latestInvoice === "string") {
        const fetchedInvoice = await stripe.invoices.retrieve(latestInvoice);
        invoice_pdf = fetchedInvoice.invoice_pdf ?? undefined;
      }

      const updateData: { subscriptionStatus: string; invoicePdfUrl?: string } =
      {
        subscriptionStatus: status,
      };
      if (invoice_pdf) {
        updateData.invoicePdfUrl = invoice_pdf;
      }
      await updateUserInDB({ customerId }, updateData);

      if (email) {
        const htmlContent = `
          <p>Your subscription status is now: <strong>${status}</strong>.</p>
          ${invoice_pdf
            ? `<p>You can view your latest invoice <a href="${invoice_pdf}" target="_blank">here</a>.</p>`
            : `<p>No invoice is available at the moment.</p>`
          }
        `;
        await sendEmail(
          email,
          "Subscription Updated",
          `Your subscription status is now ${status}.`,
          htmlContent
        );
        console.log(`Subscription update email sent to ${email}`);
      }
    }
  } catch (error) {
    console.error(
      `Error handling subscription update for customerId: ${customerId}`,
      error
    );
  }
};

const handleSubscriptionCanceled = async (
  schedule: Stripe.SubscriptionSchedule
) => {
  const status = schedule.status; // e.g. "canceled"
  const customerId = schedule.customer as string;

  try {
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
  } catch (error) {
    console.error(
      `Error handling subscription schedule cancellation for customerId: ${customerId}`,
      error
    );
  }
};

const handleInvoiceFinalized = async (invoice: Stripe.Invoice) => {
  const email = invoice.customer_email;
  const pdfUrl = invoice.invoice_pdf;
  const total = invoice.amount_due / 100;
  const customerId = invoice.customer as string;

  await updateUserInDB(
    { email },
    { customerId, invoice_pdf: pdfUrl, subscriptionStatus: "active" }
  );

  //   if (email) {
  //     const htmlContent = `
  //       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
  //   <!-- Header Section -->
  //   <div style="background-color: #0d6efd; color: #ffffff; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
  //     <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Invoice Finalized</h1>
  //   </div>

  //   <!-- Body Content -->
  //   <div style="padding: 20px;">
  //     <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
  //       Hello,
  //     </p>
  //     <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
  //       We’re pleased to inform you that your invoice has been finalized. The total amount is:
  //     </p>
  //     <p style="font-size: 20px; color: #0d6efd; font-weight: bold; text-align: center; margin: 20px 0;">
  //       $${total.toFixed(2)}
  //     </p>
  //     <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
  //       You can view or download your invoice using the button below:
  //     </p>
  //     <div style="text-align: center; margin-bottom: 30px;">
  //       <a href="${pdfUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0d6efd; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px;">
  //         Download Invoice PDF
  //       </a>
  //     </div>
  //     <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
  //       Thank you for your continued support and being a valued subscriber.
  //     </p>
  //   </div>

  //   <!-- Footer Section -->
  //   <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #888888;">
  //     <p style="margin: 0;">
  //       If you have any questions, feel free to <a href="mailto:support@example.com" style="color: #0d6efd; text-decoration: none;">contact us</a>.
  //     </p>
  //     <p style="margin: 10px 0 0;">&copy; ${new Date().getFullYear()} The Team. All rights reserved.</p>
  //   </div>
  // </div>

  //     `;

  //     try {
  //       await sendEmail(
  //         email,
  //         "Your Invoice is Finalized",
  //         `Hello, Your invoice for $${total.toFixed(2)} is finalized. Download your invoice here: ${pdfUrl}`, // Plain-text fallback
  //         htmlContent
  //       );
  //       console.log(`Finalized invoice email sent to ${email}`);
  //     } catch (error) {
  //       console.error(`Failed to send finalized invoice email to ${email}:`, error);
  //     }
  //   }

};

const handleSubscriptionDeleted = async (subscription: Stripe.Subscription) => {
  const customerId = subscription.customer as string;
  await updateUserInDB({ customerId }, { subscriptionStatus: "canceled" });
  console.log(`Subscription deleted for customerId: ${customerId}`);
};

/** 7) New Handler: Invoice Payment Succeeded
    -----------------------------------------
    This fires whenever a recurring invoice is paid (e.g., monthly subscription). */

const handleInvoicePaymentSucceeded = async (invoice: Stripe.Invoice) => {
  const email = invoice.customer_email;
  const amountPaid = (invoice.amount_paid ?? 0) / 100;
  const pdfUrl = invoice.invoice_pdf;
  const invoiceId = invoice.id;
  const customerId = invoice.customer as string;

  await updateUserInDB({ customerId }, { subscriptionStatus: "active", invoice_pdf: pdfUrl });

  console.log(
    `✅ [invoice.payment_succeeded] Invoice ${invoiceId} for $${amountPaid} was paid.`
  );

  if (email) {
    try {
      const textContent = `Hello,

We have successfully processed your monthly subscription payment of $${amountPaid.toFixed(
        2
      )}.
Invoice ID: ${invoiceId}
${pdfUrl ? `Download PDF: ${pdfUrl}` : ""}

Thank you for being a valued subscriber!
– The Team
`;

      const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
  <!-- Header Section -->
  <div style="background-color: #0d6efd; color: #ffffff; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Invoice Finalized</h1>
  </div>

  <!-- Body Content -->
  <div style="padding: 20px;">
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      Hello,
    </p>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      We’re pleased to inform you that your invoice has been finalized. The total amount is:
    </p>
    <p style="font-size: 20px; color: #0d6efd; font-weight: bold; text-align: center; margin: 20px 0;">
      $${amountPaid.toFixed(2)}
    </p>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      You can view or download your invoice using the button below:
    </p>
    <div style="text-align: center; margin-bottom: 30px;">
      <a href="${pdfUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0d6efd; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px;">
        Download Invoice PDF
      </a>
    </div>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      Thank you for your continued support and being a valued subscriber.
    </p>
  </div>

  <!-- Footer Section -->
  <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #888888;">
    <p style="margin: 0;">
      If you have any questions, feel free to <a href="mailto:support@example.com" style="color: #0d6efd; text-decoration: none;">contact us</a>.
    </p>
    <p style="margin: 10px 0 0;">&copy; ${new Date().getFullYear()} The Team. All rights reserved.</p>
  </div>
</div>

    `;

      await sendEmail(
        email,
        "Monthly Subscription Payment Successful",
        textContent,
        htmlContent
      );
      console.log(`Email sent to ${email}`);
    } catch (emailErr) {
      console.error("Error sending payment success email:", emailErr);
    }
  } else {
    console.log("No email on invoice; consider retrieving customer to get their email.");
  }

};



const handleChargeUpdated = async (charge: Stripe.Charge) => {
  const customerId = charge.customer as string;
  const receiptUrl = charge.receipt_url;
  const paymentStatus = charge.status;
  const paymentIntentId = charge.payment_intent as string;
  const paymentMethodId = charge.payment_method as string;
  const amount = charge.amount / 100;


  try {

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const monthlyPaymentId = paymentIntent.metadata.monthlyPaymentId;
    const ownerId = paymentIntent.metadata.ownerId;
    const lateFee = paymentIntent.metadata.lateFee;

    const tenantPayment = await TenantPayment.findOne({
      _id: monthlyPaymentId,
      status: "Pending",
    });

    

    if (!tenantPayment) {
      console.warn(`⚠ No matching payment found for monthlyPaymentId: ${monthlyPaymentId}`);
      return;
    }

    await User.findByIdAndUpdate(
      { _id: tenantPayment?.userId },
      { $set: { isSecurityDepositPay : true } },
      { new: true, runValidators: true }
    );

    await TenantPayment.findByIdAndUpdate(
      { _id: monthlyPaymentId },
      { $set: { invoice: receiptUrl, status: "Paid", paidAmount : amount, PaymentPlaced: new Date(), lateFee } },
      { new: true, runValidators: true }
    );

    const ownerData = await User.findById({ _id: ownerId })

    if (ownerData) {
      await User.findOneAndUpdate(
        { _id: ownerId },
        { paidAmount: (ownerData?.paidAmount ? parseInt(ownerData?.paidAmount.toString()) : 0) + parseInt(amount.toString()) },
        { new: true, runValidators: true }
      )
    }

    let email = null;
    if (paymentMethodId) {
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      email = paymentMethod?.billing_details?.email;
    }

    if (!email) {
      console.warn(`⚠ No email found for customer: ${customerId}. Payment ID: ${monthlyPaymentId}`);
      return;
    }

    if (receiptUrl) {
      const emailSubject = "📄 Payment Receipt for Your Rent";
      const emailText = `Hello, your rent payment has been successfully processed. You can view your receipt here: ${receiptUrl}.`;
      const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          <!-- Header Section -->
          <div style="background: linear-gradient(135deg, #6a11cb, #2575fc); color: #ffffff; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: bold;">🏠 Rent Payment Receipt</h1>
          </div>
  
          <!-- Body Content -->
          <div style="padding: 20px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6;">
                  Hello,
              </p>
              <p style="color: #333333; font-size: 16px; line-height: 1.6;">
                  We are pleased to confirm that your rent payment has been successfully processed.
              </p>
              <p style="font-size: 20px; color: #2575fc; font-weight: bold; text-align: center; margin: 20px 0;">
                  Payment ID: <strong>${monthlyPaymentId}</strong>
              </p>
              <p style="color: #333333; font-size: 16px; line-height: 1.6;">
                  You can view and download your receipt by clicking the button below:
              </p>
  
              <!-- Call to Action Button -->
              <div style="text-align: center; margin-bottom: 30px;">
                  <a href="${receiptUrl}" style="display: inline-block; padding: 14px 24px; background-color: #2575fc; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px; box-shadow: 0px 4px 10px rgba(37, 117, 252, 0.2);">
                      📄 View Receipt
                  </a>
              </div>
  
              <p style="color: #333333; font-size: 16px; line-height: 1.6;">
                  Thank you for your payment! If you have any questions, please feel free to contact us.
              </p>
          </div>
  
          <!-- Footer Section -->
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #888888;">
              <p style="margin: 0;">
                  Need help? <a href="mailto:support@example.com" style="color: #2575fc; text-decoration: none;">Contact Support</a>
              </p>
              <p style="margin: 10px 0 0;">&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
          </div>
      </div>
      `;

      await sendEmail(email, emailSubject, emailText, emailHtml);
      console.log(`✅ Rent payment updated. Receipt sent to: ${email}`);
    }


  } catch (error) {
    console.error(`❌ Error handling charge update for customer: ${customerId}`, error);
  }
};



export const stripePaymentService = {
  stripePayment,
  cancelSubscription,
  Webhook,
};
