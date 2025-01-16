import { Properties, Tenant, Unit } from "../owner/owner.module"
import { User } from "../User/user.model";


const getALlPropertiesFromDB = async () =>{
    const result = await Properties.find().sort({createdAt : -1});
    return result
}

const getSinglePropertiesAllUnitsFromDB = async(id : string ) =>{
    const property = await Properties.findById({_id : id}).populate("ownerId");
    const allUnits = await Unit.find({propertyId : id });
    const result = {
        property,
        allUnits
    }
    return result    
}

const getALlTenantsFormDB = async () =>{
    const result = await Tenant.find().populate([{path : "userId"}, {path : "propertyId"}, {path : "unitId"}]);
    return result
  }
  
const getSingleTenantDetailseFromDB = async (id : string ) =>{
    const result = await Tenant.findById({_id : id}).populate([{path : "userId"}, {path : "propertyId"}, {path : "unitId"}]);
    return result
}

const getSingleOwnerAllPropertiesWithOwnerInfoFromDB = async(id : string ) =>{
    const ownerData = await User.find({_id : id })
    const properties = await Properties.find({ownerId : id }).sort({createdAt : -1})
    return {
        ownerData,
        properties
    }
}

export const AdminService = {
    getALlPropertiesFromDB,
    getSinglePropertiesAllUnitsFromDB,
    getALlTenantsFormDB,
    getSingleTenantDetailseFromDB,
    getSingleOwnerAllPropertiesWithOwnerInfoFromDB
}