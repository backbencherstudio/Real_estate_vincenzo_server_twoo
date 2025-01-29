/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Tenant } from "../owner/owner.module";
import { TenantPayment } from "./payment.module";

const createALlTenantsForPaymentFormDB = async () => {
    try {        
        const tenants = await Tenant.find({ isDeleted: false }).lean();
        const payments = tenants.map(tenant => {
            const { _id, ...tenantData } = tenant; 
            return { ...tenantData, status: "Pending", invoice: "Upcomming" }; 
        });
        const result = await TenantPayment.insertMany(payments);
        return result;
    } catch (error) {
        console.error("Error inserting tenant payments:", error);
        throw error;
    }
};

const getAllTenantPaymentDataFromDB = async () =>{
    const result = await TenantPayment.find().sort({ createdAt : -1 })
    return result
}

const getSingleUserAllPaymentDataFromDB = async (userId : string) =>{
    const result = await TenantPayment.find({userId}).populate([{path : "userId"}, {path : "unitId"}, {path : "propertyId"}]).sort({ createdAt : -1 })
    return result
}




export const paymentService = {
    createALlTenantsForPaymentFormDB,
    getAllTenantPaymentDataFromDB,
    getSingleUserAllPaymentDataFromDB
};
