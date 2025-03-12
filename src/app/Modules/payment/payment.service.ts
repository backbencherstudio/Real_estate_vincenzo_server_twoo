/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Stripe from "stripe";
import { Tenant } from "../owner/owner.module";
import { OwnerPayout, TenantPayment } from "./payment.module";
import { TOwnerPayOut } from "./payment.interface";
import config from "../../config";
import { User } from "../User/user.model";
import cron from "node-cron"

const stripe = new Stripe(config.stripe_test_secret_key as string);

const stripeTenantPaymentFun = async (paymentData: any) => {
    const { paymentMethodId, amount, lateFee, monthlyPaymentId, ownerId } = paymentData;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Ensure cents conversion
            currency: "usd",
            payment_method: paymentMethodId,
            payment_method_types: ["card"],
            confirm: true,
            metadata: {
                monthlyPaymentId,
                ownerId,
                lateFee,
            },
        });

        return { success: true, paymentIntent };
    } catch (err: any) {
        console.error("Stripe Error:", err);
        return { success: false, error: err.message || "Payment failed" };
    }
};




// const stripeTenantACHpaymentFun = async (paymentData : any) =>{
//     console.log(40, paymentData);
    
//     try {
//         const { amount, accountHolder, accountNumber, routingNumber, email, monthlyPaymentId, ownerId, lateFee } = paymentData;

//         const customer = await stripe.customers.create({
//             email,
//             name: accountHolder,
//         });

//         const bankAccount = await stripe.paymentMethods.create({
//             type: "us_bank_account",
//             us_bank_account: {
//                 account_number: accountNumber,
//                 routing_number: routingNumber,
//                 account_holder_type: "individual",
//             },
//         });

//         await stripe.paymentMethods.attach(bankAccount.id, { customer: customer.id });

//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: Math.round(amount * 100), 
//             currency: "usd",
//             customer: customer.id,
//             payment_method: bankAccount.id,
//             payment_method_types: ["us_bank_account"],
//             confirm: true,
//             metadata: {
//                 monthlyPaymentId,
//                 ownerId,
//                 lateFee,
//             },
//         });

//         return paymentIntent
//     } catch (error) {
//         console.error("Error processing payment:", error);
//         // res.status(500).json({ success: false, message: error.message });
//     } 
// }


// const stripeTenantACHpaymentFun = async (paymentData: any) => {
//     console.log(40, paymentData);

//     try {
//         const { amount, accountHolder, accountNumber, routingNumber, email, monthlyPaymentId, ownerId, lateFee } = paymentData;

//         const customer = await stripe.customers.create({
//             email,
//             name: accountHolder,
//         });

//         console.log(customer);
        

//         // 2️⃣ Create a US Bank Account Payment Method
//         const bankAccount = await stripe.paymentMethods.create({
//             type: "us_bank_account",
//             us_bank_account: {
//                 account_number: accountNumber,
//                 routing_number: routingNumber,
//                 account_holder_type: "individual",
//             },
//             billing_details: {
//                 name: accountHolder,
//                 email: email,
//             },
//         });

//         // 3️⃣ Attach the bank account to the customer
//         await stripe.paymentMethods.attach(bankAccount.id, { customer: customer.id });

//         // 4️⃣ Create a Payment Intent
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: Math.round(amount * 100), // Convert to cents
//             currency: "usd",
//             customer: customer.id,
//             payment_method: bankAccount.id,
//             payment_method_types: ["us_bank_account"],
//             confirm: true,
//             metadata: {
//                 monthlyPaymentId,
//                 ownerId,
//                 lateFee,
//             },
//         });

//         console.log(130, paymentIntent);
        

//         return paymentIntent;
//     } catch (error) {
//         console.error("Error processing payment:", error);
//     }
// };



const stripeTenantACHpaymentFun = async (paymentData: any) => {
    console.log(40, paymentData);

    try {
        const { amount, accountHolder, accountNumber, routingNumber, email, monthlyPaymentId, ownerId, lateFee } = paymentData;

        // Step 1: Create a Customer
        const customer = await stripe.customers.create({
            email,
            name: accountHolder,
        });
        console.log(customer);

        // Step 2: Create a US Bank Account Payment Method
        const bankAccount = await stripe.paymentMethods.create({
            type: "us_bank_account",
            us_bank_account: {
                account_number: accountNumber,
                routing_number: routingNumber,
                account_holder_type: "individual",
            },
            billing_details: {
                name: accountHolder,
                email: email,
            },
        });

        // Step 3: Create a Setup Intent and allow us_bank_account as a payment method type
        const setupIntent = await stripe.setupIntents.create({
            customer: customer.id,
            payment_method: bankAccount.id,
            payment_method_types: ["us_bank_account"], // Explicitly allow ACH payments
            confirm: true,
        });

        console.log(177, "Setup Intent created:", setupIntent);

        // Step 4: Once verified (micro-deposits confirmed), you can attach the payment method to the customer
        await stripe.paymentMethods.attach(bankAccount.id, { customer: customer.id });

        // Step 5: Create a Payment Intent and confirm the payment
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: "usd",
            customer: customer.id,
            payment_method: bankAccount.id,
            payment_method_types: ["us_bank_account"],
            confirm: true,
            metadata: {
                monthlyPaymentId,
                ownerId,
                lateFee,
            },
        });

        console.log(197, paymentIntent);
        
        return paymentIntent;
    } catch (error) {
        console.error("Error processing payment:", error);
    }
};








const createAllTenantsForPaymentFormDB = async () => {
    try {
        const tenants = await Tenant.find({ isDeleted: false }).lean();
        if (!tenants.length) throw new Error("No tenants found");        

        const payments = tenants.map(({ _id, ...tenant }) => ({
            ...tenant,
            status: "Pending",
            invoice: "Upcoming",
        }));       

        const result = await TenantPayment.insertMany(payments);
        return result;
    } catch (error) {
        console.error("Error inserting tenant payments:", error);
        throw error;
    }
};


cron.schedule('0 0 1 * *', async () => {
    await createAllTenantsForPaymentFormDB();
});




const getAllTenantPaymentDataFromDB = async () => {
    return await TenantPayment.find().sort({ createdAt: -1 }).lean();
};

const getSingleUserAllPaymentDataFromDB = async (userId: string) => {
    return await TenantPayment.find({ userId })
        .populate([{ path: "userId" }, { path: "unitId" }, { path: "propertyId" }])
        .sort({ status: 1, updatedAt: -1, createdAt: -1 })
        .lean();
};

// =========================== PAYOUT FUNCTIONS ===========================

const getPayoutDataFromDBbySingleOwner = async (ownerId: string) => {
    return await OwnerPayout.find({ ownerId }).sort({ createdAt: -1 }).lean();
};

const createPayoutByOwnerIntoDB = async (payload: TOwnerPayOut) => {
    return await OwnerPayout.create(payload);
};

const getPayoutDataFromDBbyAdmin = async () => {
    return await OwnerPayout.find().sort({ createdAt: -1 }).lean();
};

 const createConnectedAccount = async (email: string) => {
    console.log(89, email);
    
    try {
        const connectedAccount = await stripe.accounts.create({
            type: "express",
            email,
            country: "US",
            capabilities: {
                transfers: { requested: true },
            },
        });
        return connectedAccount;
    } catch (error: any) {
        console.error("Error creating connected account:", error);
        throw new Error(error.message || "Failed to create connected account");
    }
};

 const createOnboardingLink = async (accountId: string) => {    
    console.log(108, accountId);
    
    try {
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${config.frontend_url}/admin/payOut`,
            return_url: `${config.frontend_url}/admin/payOut`,
            type: "account_onboarding",
        });        
        console.log(110, accountLink);
        return accountLink.url;
    } catch (error: any) {
        console.error("Error creating onboarding link:", error);
        throw new Error(error.message || "Failed to create onboarding link");
    }
};


const sendPayoutRequestByOwnerToStripe = async (data: any) => {
    console.log(123,  data?.email);
    
    try {
        const {email} = data;
        const  connectedAccount = await createConnectedAccount(email);
        
        const onboardingUrl = await createOnboardingLink(connectedAccount?.id);        
        return { success: true, result: {onboardingUrl}, message: "✅ Payout processed successfully!" };
    } catch (error: any) {
        console.error("🔥 Payout Error:", error);
        return { success: false, message: "❌ Error processing payout", error: error.message };
    }
};

const sendPayoutRequestByAdminToStripe = async (data: any) => {
    try {
        console.log("🚀 Processing payout request:", data);
        const { amount, ownerId, key } = data.record;
        const selectedStatus = data.selectedStatus;

        console.log(231, "ownerId", ownerId);

        if (selectedStatus !== "Accepted") {
            await OwnerPayout.findOneAndUpdate(
                { _id: key },
                { $set: { status: "Rejected" } }
            );
            return { success: false, message: "❌ Payout request Rejected!" };
        }

        const balance = await stripe.balance.retrieve();
        const availableBalance = balance.available.find(b => b.currency === "usd")?.amount || 0;

        if (availableBalance < Math.round(amount * 100)) {
            console.log(248, "❌ Insufficient funds in admin's Stripe balance.");            
            return { success: false, message: "❌ Insufficient funds in admin's Stripe balance." };
        }

        const owner = await User.findById(ownerId);
        if (!owner || !owner.stripeAccountId) {
            return { success: false, message: "❌ Owner's Stripe account not found!" };
        }

        const accountId = owner.stripeAccountId;
        console.log(248, `✅ Sending payout to Stripe account: ${accountId}`);

        await OwnerPayout.findOneAndUpdate(
            { _id: key },
            { $set: { status: "On Progress" } }
        );

        const payout = await stripe.transfers.create({
            amount: Math.round(amount * 100), 
            currency: "usd",            
            destination: accountId, 
            description: "Payout from Admin to Owner",
            metadata: {
                ownerId,  
                payoutKey: key, // this key is payout _id 
                email: owner.email,
            },
        });

        console.log(266, payout);
        

        await OwnerPayout.findOneAndUpdate(
            { _id: key },
            { $set: { payoutId: payout.id } }
        );

        console.log(274, "✅ Payout Processed:", payout.id);

        return { success: true, result: { payoutId: payout.id }, message: "✅ Payout processed successfully!" };

    } catch (error: any) {
        console.error("🔥 Payout Error:", error);
        return { success: false, message: "❌ Error processing payout", error: error.message };
    }
};


// const sendPayoutRequestByAdminToStripe = async (data: any) => {
//     try {
//         console.log("🚀 Processing payout request:", data);
//         const { amount, ownerId, key } = data.record;
//         const selectedStatus = data.selectedStatus;

//         console.log(231, "Owner ID:", ownerId);

//         if (selectedStatus !== "Accepted") {
//             await OwnerPayout.findOneAndUpdate(
//                 { _id: key },
//                 { $set: { status: "Rejected" } }
//             );
//             return { success: false, message: "❌ Payout request Rejected!" };
//         }

//         const owner = await User.findById(ownerId);
//         if (!owner || !owner.stripeAccountId) {
//             return { success: false, message: "❌ Owner's Stripe account not found!" };
//         }

//         const accountId = owner.stripeAccountId;
//         console.log(248, `✅ Sending payout to Stripe account: ${accountId}`);

//         await OwnerPayout.findOneAndUpdate(
//             { _id: key },
//             { $set: { status: "On Progress" } }
//         );

//         // ✅ Use `payouts.create` instead of `transfers.create`
//         const payout = await stripe.payouts.create({
//             amount: Math.round(amount * 100), // Convert to cents
//             currency: "usd",
//             destination: accountId,  // ✅ Sending money to Owner's Stripe account
//             description: "Payment for Payout Request",
//             metadata: {
//                 ownerId: ownerId,  // ✅ Ensure metadata contains ownerId
//                 payoutKey: key,
//                 email: owner.email,
//             },
//         });

//         console.log(266, "Payout Created:", payout);

//         await OwnerPayout.findOneAndUpdate(
//             { _id: key },
//             { $set: { payoutId: payout.id } }
//         );

//         console.log(274, "✅ Payout Processed:", payout.id);

//         return { success: true, result: { payoutId: payout.id }, message: "✅ Payout processed successfully!" };

//     } catch (error: any) {
//         console.error("🔥 Payout Error:", error);
//         return { success: false, message: "❌ Error processing payout", error: error.message };
//     }
// };




export const paymentService = {
    stripeTenantPaymentFun,
    stripeTenantACHpaymentFun,
    createAllTenantsForPaymentFormDB,
    getAllTenantPaymentDataFromDB,
    getSingleUserAllPaymentDataFromDB,
    getPayoutDataFromDBbySingleOwner,
    createPayoutByOwnerIntoDB,
    getPayoutDataFromDBbyAdmin,
    sendPayoutRequestByOwnerToStripe,
    sendPayoutRequestByAdminToStripe
};
