import { Tenant } from "../owner/owner.module"

const getTenantDetailsFromDB = async (id : string ) => {
    const result = await Tenant.findOne({userId : id}).populate([ {path : "propertyId"}, {path : "unitId"} ])
    return result
}


export const TenantService = {
    getTenantDetailsFromDB
}