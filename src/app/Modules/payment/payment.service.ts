/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Stripe from "stripe";
import { Tenant } from "../owner/owner.module";
import { OwnerPayout, TenantPayment } from "./payment.module";
import { TOwnerPayOut } from "./payment.interface";
import config from "../../config";
import { User } from "../User/user.model";

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

const createAllTenantsForPaymentFormDB = async () => {
    try {
        const tenants = await Tenant.find({ isDeleted: false }).lean();
        if (!tenants.length) throw new Error("No tenants found");

        const payments = tenants.map(tenant => ({
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
    try {
        console.log("🚀 Processing payout request:", data);
        const {email} = data;
        const  connectedAccount = await createConnectedAccount(email);
        const onboardingUrl = await createOnboardingLink(connectedAccount?.id);        
        return { success: true, result: {onboardingUrl}, message: "✅ Payout processed successfully!" };
    } catch (error: any) {
        console.error("🔥 Payout Error:", error);
        return { success: false, message: "❌ Error processing payout", error: error.message };
    }
};



// const sendPayoutRequestByOwnerToStripe = async (data: any) => {
//     try {
//         console.log("🚀 Processing payout request:", data);
//         const { email, amount, accountId, ownerId, key } = data.record;
//         const selectedStatus = data.selectedStatus;

//         if (selectedStatus !== "Accepted") {
//             return { success: false, message: "❌ Payout request must be accepted first!" };
//         }
//         let connectedAccount;
//         try {
//             connectedAccount = await stripe.accounts.retrieve(accountId);
//         } catch {
//             console.log("⚠️ No existing connected account, creating a new one...");
//             connectedAccount = await createConnectedAccount(email);
//         }

//         if (!connectedAccount.details_submitted) {
//             console.log("⚠️ User needs to complete onboarding.");
//             const onboardingUrl = await createOnboardingLink(connectedAccount.id);
//             return { success: false, result: { onboardingUrl }, message: "⚠️ The account needs onboarding." };
//         }

//         const payout = await stripe.transfers.create({
//             amount: Math.round(amount * 100), 
//             currency: "usd",
//             destination: connectedAccount.id, 
//             metadata: {
//                 ownerId, 
//                 payoutKey: key, 
//                 email,
//             },
//         });

//         console.log(172, "✅ Payout Processed:", payout.id);

//         return { success: true, result: { payoutId: payout.id }, message: "✅ Payout processed successfully!" };

//     } catch (error: any) {
//         console.error("🔥 Payout Error:", error);
//         return { success: false, message: "❌ Error processing payout", error: error.message };
//     }
// };

// const sendPayoutRequestByAdminToStripe = async (data: any) => {
//     try {
//         console.log("🚀 Processing payout request:", data);
//         const { amount, ownerId, key } = data.record;
//         const selectedStatus = data.selectedStatus;

//         if (selectedStatus !== "Accepted") {
//             return { success: false, message: "❌ Payout request must be accepted first!" };
//         }

//         // 1️⃣ Find the owner's Stripe account ID
//         const owner = await User.findById(ownerId);
//         if (!owner || !owner.stripeAccountId) {
//             return { success: false, message: "❌ Owner's Stripe account not found!" };
//         }

//         const accountId = owner.stripeAccountId;
//         console.log(`✅ Sending payout to Stripe account: ${accountId}`);

//         // 2️⃣ Update `OwnerPayout` status to "On Progress"
//         await OwnerPayout.findOneAndUpdate(
//             { _id: key },
//             { $set: { status: "On Progress" } }
//         );

//         // 3️⃣ Create Payout (Send Money)
//         const payout = await stripe.transfers.create({
//             amount: Math.round(amount * 100), // Convert dollars to cents
//             currency: "usd",
//             destination: accountId, // ✅ Send money to the connected Stripe account
//             metadata: {
//                 ownerId,  // ✅ Track ownerId
//                 payoutKey: key,  // ✅ Track payout request
//                 email: owner.email, // ✅ Track email for confirmation
//             },
//         });

//         console.log("✅ Payout Processed:", payout.id);

//         return { success: true, result: { payoutId: payout.id }, message: "✅ Payout processed successfully!" };

//     } catch (error: any) {
//         console.error("🔥 Payout Error:", error);
//         return { success: false, message: "❌ Error processing payout", error: error.message };
//     }
// };

const sendPayoutRequestByAdminToStripe = async (data: any) => {
    try {
        console.log("🚀 Processing payout request:", data);
        const { amount, ownerId, key } = data.record;
        const selectedStatus = data.selectedStatus;

        if (selectedStatus !== "Accepted") {
            await OwnerPayout.findOneAndUpdate(
                { _id: key },
                { $set: { status: "Rejected" } }
            );
            return { success: false, message: "❌ Payout request Rejected!" };
        }

        const owner = await User.findById(ownerId);
        if (!owner || !owner.stripeAccountId) {
            return { success: false, message: "❌ Owner's Stripe account not found!" };
        }

        const accountId = owner.stripeAccountId;
        console.log(`✅ Sending payout to Stripe account: ${accountId}`);

        await OwnerPayout.findOneAndUpdate(
            { _id: key },
            { $set: { status: "On Progress" } }
        );

        const payout = await stripe.transfers.create({
            amount: Math.round(amount * 100), 
            currency: "usd",
            destination: accountId, 
            metadata: {
                ownerId,  
                payoutKey: key, 
                email: owner.email,
            },
        });

        await OwnerPayout.findOneAndUpdate(
            { _id: key },
            { $set: { payoutId: payout.id } }
        );

        console.log("✅ Payout Processed:", payout.id);

        return { success: true, result: { payoutId: payout.id }, message: "✅ Payout processed successfully!" };

    } catch (error: any) {
        console.error("🔥 Payout Error:", error);
        return { success: false, message: "❌ Error processing payout", error: error.message };
    }
};



export const paymentService = {
    stripeTenantPaymentFun,
    createAllTenantsForPaymentFormDB,
    getAllTenantPaymentDataFromDB,
    getSingleUserAllPaymentDataFromDB,
    getPayoutDataFromDBbySingleOwner,
    createPayoutByOwnerIntoDB,
    getPayoutDataFromDBbyAdmin,
    sendPayoutRequestByOwnerToStripe,
    sendPayoutRequestByAdminToStripe
};
