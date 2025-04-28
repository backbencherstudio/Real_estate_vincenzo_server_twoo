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
import { reminderEmailNotificationForDuePayment } from "../../utils/reminderEmailNotificationForDuePayment";
import { ObjectId } from "mongodb";

const stripe = new Stripe(config.stripe_test_secret_key as string);

const stripeTenantPaymentFun = async (paymentData: any) => {
    const { paymentMethodId, amount, lateFee, monthlyPaymentId, ownerId, cashPay, paymentBy } = paymentData;


    try {
        const paymentIntent = await stripe.paymentIntents.create({
            // amount: Math.round(amount * 100),
            amount: Math.round(Number(parseFloat(amount).toFixed(2)) * 100),
            currency: "usd",
            payment_method: paymentMethodId,
            payment_method_types: ["card"],
            confirm: true,
            metadata: {
                monthlyPaymentId,
                ownerId,
                lateFee,
                cashPay,
                paymentBy
            },
        });

        return { success: true, paymentIntent };
    } catch (err: any) {
        console.error("Stripe Error:", err);
        return { success: false, error: err.message || "Payment failed" };
    }
};


// ============================= ACH Payment Start ==============================


const createCustomerService = async (payload: any) => {
    try {
        const { name, email } = payload;
        const customer = await stripe.customers.create({ name, email });
        return ({ customerId: customer.id });
    } catch (error: any) {
        return ({ error: error.message });
    }
}

const createBankTokenService = async (payload: any) => {
    try {
        const { account_number, routing_number, account_holder_name } = payload;

        const bankToken = await stripe.tokens.create({
            bank_account: {
                country: 'US',
                currency: 'usd',
                account_holder_name,
                account_holder_type: 'individual',
                routing_number,
                account_number,
            },
        });

        return ({ bankToken: bankToken.id });
    } catch (error: any) {
        return ({ error: error.message });
    }
}

const attachACHbankAccountService = async (payload: any) => {
    try {
        const { customerId, bankToken } = payload;
        const bankAccount = await stripe.customers.createSource(customerId, { source: bankToken });
        return (bankAccount);
    } catch (error: any) {
        return ({ error: error.message });
    }
}

// const verifyBankAccountService = async (payload: any) => {
//     try {
//         const { customerId, bankAccountId, amounts } = payload;
//         const verification = await stripe.customers.verifySource(customerId, bankAccountId, {
//             amounts,
//         });

//         return ({ verification });
//     } catch (error: any) {
//         return ({ error: error.message });
//     }
// }


const verifyBankAccountService = async (payload: any) => {
    try {
        const { customerId, bankAccountId, amounts } = payload;
        const verification = await stripe.customers.verifySource(
            customerId, 
            bankAccountId, 
            { amounts }
        );
        
        return { 
            success: true,
            data: { verification },
            message: "Verification initiated"
        };
    } catch (error: any) {
        console.error('Verification error:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}


const payRentService = async (payload: any) => {

    try {
        const { customerId, bankAccountId, amount, lateFee, monthlyPaymentId, ownerId, email, paymentBy } = payload;
        const charge = await stripe.charges.create({
            amount: amount * 100,
            currency: 'usd',
            customer: customerId,
            source: bankAccountId,
            description: 'Monthly Rent Payment',
            metadata: {
                monthlyPaymentId,
                ownerId,
                lateFee,
                email,
                paymentBy
            }
        });


        if (charge?.id) {
            await TenantPayment.findByIdAndUpdate(
                { _id: monthlyPaymentId },
                {
                    $set: {
                        status: "Processing",
                    },
                },
                { new: true, runValidators: true }
            );

            await User.findOneAndUpdate(
                { email },
                { $set: { customerId, bankAccountId } },
                { new: true, runValidators: true }
            )
        }
        return (charge);
    } catch (error: any) {
        return ({ error: error.message });
    }
}


// ============================= ACH Payment End ==============================


const createAllTenantsForPaymentFormDB = async (ownerId: string) => {
    try {
        const ownerData = await User.findById({ _id: ownerId }).select("lastDueDateNumber");
        const tenants = await Tenant.find({ isDeleted: false, ownerId }).lean();

        if (!tenants.length) throw new Error("No tenants found");
        if (!ownerData?.lastDueDateNumber) throw new Error("At first set your last due date");

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        const dueDay = ownerData.lastDueDateNumber;
        const formattedDueDate = new Date(Date.UTC(year, month, dueDay, 0, 0, 0));
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

        const existingPayments = await TenantPayment.find({
            ownerId,
            lastDueDate: { $gte: startOfMonth, $lte: endOfMonth }
        });

        if (existingPayments.length > 0) {
            throw new Error("Payment data for this month already exists");
        }

        const payments = tenants.map(({ _id, ...tenant }) => ({
            ...tenant,
            ownerId,
            status: "Pending",
            invoice: "Upcoming",
            lastDueDate: formattedDueDate,
        }));

        const result = await TenantPayment.insertMany(payments);
        return result;
    } catch (error) {
        console.error("Error inserting tenant payments:", error);
        throw error;
    }
};


// cron.schedule('0 0 1 * *', async () => {
//     await createAllTenantsForPaymentFormDB();
// });

const remindersTenantDueRentEmailNotification = async (ownerId: string) => {
    const result = await TenantPayment.aggregate([
        {
            $match: { status: "Pending", ownerId: new ObjectId(ownerId) }
        },
        {
            $group: {
                _id: "$userId"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "userDetails"
            }
        },
        {
            $unwind: "$userDetails"
        },
        {
            $project: { _id: 0, email: "$userDetails.email" }
        }
    ]);

    const emails = result.map(user => user.email);
    await reminderEmailNotificationForDuePayment(emails)
    return emails;
};



// cron.schedule('0 0 0 3 * *', async () => { 
//     await remindersTenantDueRentEmailNotification();
// });



const getAllTenantPaymentDataFromDB = async () => {
    return await TenantPayment.find().sort({ createdAt: -1 }).lean();
};


const getSingleUserAllPaymentDataFromDB = async (userId: string) => {
    const result = await TenantPayment.find({ userId })
        .populate([{ path: "userId" }, { path: "unitId" }, { path: "propertyId" }])
    return result.reverse()
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
        const { email } = data;
        const connectedAccount = await createConnectedAccount(email);

        const onboardingUrl = await createOnboardingLink(connectedAccount?.id);
        return { success: true, result: { onboardingUrl }, message: "✅ Payout processed successfully!" };
    } catch (error: any) {
        console.error("🔥 Payout Error:", error);
        return { success: false, message: "❌ Error processing payout", error: error.message };
    }
};

const sendPayoutRequestByAdminToStripe = async (data: any) => {
    try {
        const { amount, ownerId, key } = data.record;
        const selectedStatus = data.selectedStatus;
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

const planService = async (planData: any) => {
    const { email, ...data } = planData;
    const result = await User.findOneAndUpdate(
        { email },
        { $set: data },
        { new: true, runValidators: true }
    );
    return result;
}


export const paymentService = {
    stripeTenantPaymentFun,
    createCustomerService,
    createBankTokenService,
    verifyBankAccountService,
    attachACHbankAccountService,
    payRentService,
    createAllTenantsForPaymentFormDB,
    getAllTenantPaymentDataFromDB,
    getSingleUserAllPaymentDataFromDB,
    getPayoutDataFromDBbySingleOwner,
    createPayoutByOwnerIntoDB,
    getPayoutDataFromDBbyAdmin,
    sendPayoutRequestByOwnerToStripe,
    sendPayoutRequestByAdminToStripe,
    planService,
    remindersTenantDueRentEmailNotification
};
