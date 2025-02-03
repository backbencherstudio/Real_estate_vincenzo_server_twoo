/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Stripe from "stripe";
import { Tenant } from "../owner/owner.module";
import { TenantPayment } from "./payment.module";

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

        // Insert into TenantPayment collection
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


export const paymentService = {
    stripeTenantPaymentFun,
    createALlTenantsForPaymentFormDB,
    getAllTenantPaymentDataFromDB,
    getSingleUserAllPaymentDataFromDB
};
