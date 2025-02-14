import { Tenant } from "../owner/owner.module"
import { User } from "../User/user.model";

const getTenantDetailsFromDB = async (id: string) => {
    const result = await Tenant.findOne({ userId: id }).populate([{ path: "propertyId" }, { path: "unitId" }, {
        path: "ownerId",
        select: "name profileImage permanentAddress"
    }])
    return result
}


const getAllTenantsForMessageFromDBForEachPropertyTenant = async (userId: string) => {
    const tenant = await Tenant.findOne({ userId });
    if (!tenant) {
        console.log("No tenant found for this userId.");
        return null;
    }
    const propertyId = tenant.propertyId;
    const allTenantSingleProperty = await Tenant.find({ propertyId })
        .populate({ path: "userId", select: "name email role profileImage" });
        const ownerData = await User.findById({_id : tenant.ownerId}).select("name email role profileImage")
        return [...allTenantSingleProperty.map(t => t.userId), ownerData];
};

const checkOwnerActiveOrNot = async (tenantId : string ) =>{
    const tenantData = await Tenant.findOne({userId : tenantId})
    const ownerData = await User.findById({_id : tenantData?.ownerId}).select("subscriptionStatus")
    return ownerData
}


export const TenantService = {
    getTenantDetailsFromDB,
    getAllTenantsForMessageFromDBForEachPropertyTenant,
    checkOwnerActiveOrNot
}