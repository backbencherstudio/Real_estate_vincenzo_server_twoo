/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Stripe from "stripe";
import { Tenant } from "../owner/owner.module";
import { OwnerPayout, TenantPayment } from "./payment.module";
import { TOwnerPayOut } from "./payment.interface";

const stripe = new Stripe(
    "sk_test_51NFvq6ArRmO7hNaVBU6gVxCbaksurKb6Sspg6o8HePfktRB4OQY6kX5qqcQgfxnLnJ3w9k2EA0T569uYp8DEcfeq00KXKRmLUw"
);


const stripeTenantPaymentFun = async (paymentData: any) => {

    const { paymentMethodId, amount, lateFee, monthlyPaymentId, ownerId } = paymentData;
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: "usd",
            payment_method: paymentMethodId,
            payment_method_types: ["card"],
            confirm: true,
            metadata: {
                monthlyPaymentId: monthlyPaymentId,
                ownerId: ownerId,
                lateFee: lateFee
            },
        });

        return ({ success: true, paymentIntent });
    } catch (err) {
        console.error("Stripe Error:", err);
        return ({ success: false, error: err });
    }
};


const createALlTenantsForPaymentFormDB = async () => {
    try {
        const tenants = await Tenant.find({ isDeleted: false }).lean();
        const payments = tenants.map(tenant => {
            const { _id, createdAt, updatedAt, ...tenantData } = tenant;
            return {
                ...tenantData,
                status: "Pending",
                invoice: "Upcoming",
            };
        });
        const result = await TenantPayment.insertMany(payments);
        return result;
    } catch (error) {
        console.error("Error inserting tenant payments:", error);
        throw error;
    }
};


const getAllTenantPaymentDataFromDB = async () => {
    const result = await TenantPayment.find().sort({ createdAt: -1 })
    return result
}

const getSingleUserAllPaymentDataFromDB = async (userId: string) => {
    const result = await TenantPayment.find({ userId }).populate([{ path: "userId" }, { path: "unitId" }, { path: "propertyId" }]).sort({ status: 1, updatedAt: -1, createdAt: -1 });
    return result
}

// =================================================================>>>>>>> PayOut Functions

const getPayoutDataFromDBbySingleOwner = async (ownerId: string) => {
    const result = await OwnerPayout.find({ ownerId }).sort({ createdAt: -1 });
    return result;
};

const createPayoutByOwnerIntoDB = async (payload: TOwnerPayOut) => {
    const result = await OwnerPayout.create(payload);
    return result
}

const getPayoutDataFromDBbyAdmin = async () => {
    // const result = await OwnerPayout.find({ status: "Pending" }).sort({ createdAt: -1 });
    const result = await OwnerPayout.find().sort({ createdAt: -1 });
    return result;
};

const sendPayoutRequestByAdminToStripe = async (data: any) => {

    console.log(data);

    if (data.selectedStatus === "Accepted") {
        const payoutData = {
            destination: data.record.accountId,
            amount: data.record.amount * 100,
            currency: "USD",
            transfer_group: "ORDER_123",
        }

        const account = await stripe.accounts.retrieve(data.record.accountId);

        console.log("✅ Account Exists:", account);
        if (!account) {
            return { return: null, message: "❌ Account Not Found" } 
        }

        const result = await stripe.transfers.create(payoutData);
        await OwnerPayout.findOneAndUpdate({ _id: data?.record?.key }, { status: "On progress" })

        return { result: result, message: "Your payment request has been submitted successfully. The transaction may take 2-7 working days to process. We appreciate your patience during this time. Thank You!" }

    }

    const result = await OwnerPayout.findOneAndUpdate({ _id: data?.record?.key }, { status: data?.selectedStatus })

    return { result: result, message: "payment request has been Rejected !!" }


}





export const paymentService = {
    stripeTenantPaymentFun,
    createALlTenantsForPaymentFormDB,
    getAllTenantPaymentDataFromDB,
    getSingleUserAllPaymentDataFromDB,
    getPayoutDataFromDBbySingleOwner,
    createPayoutByOwnerIntoDB,
    getPayoutDataFromDBbyAdmin,
    sendPayoutRequestByAdminToStripe
};
