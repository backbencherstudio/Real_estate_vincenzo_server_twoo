/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Query } from "mongoose";
import { Properties, Tenant, Unit } from "../owner/owner.module"
import { User } from "../User/user.model";
import { OverviewData } from "./admin.interface";


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


const getAllDataOverviewByAdminFromDB = async (): Promise<OverviewData> => {
    try {
        const queries: { key: keyof Omit<OverviewData, 'monthlyProperties' | 'monthlyTenants'>; query: Query<number, any> }[] = [
            { key: "propertyLength", query: Properties.countDocuments() },
            { key: "tenantLength", query: Tenant.countDocuments() },
            // { key: "unitsLength", query: Unit.countDocuments() },   // ==========================>>> if client need this data the we will show it
            { key: "ownersLength", query: User.countDocuments({ role: "owner" }) }
        ];
        const results = await Promise.all(queries.map(item => item.query));

        const monthlyProperties = await Properties.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const monthlyPropertiesData = monthlyProperties.map(item => ({
            date: item._id, 
            count: item.count
        }));

        const monthlyTenants = await Tenant.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const monthlyTenantsData = monthlyTenants.map(item => ({
            date: item._id, 
            count: item.count
        }));

        const overview = queries.reduce((acc, item, index) => {
            acc[item.key] = results[index];
            return acc;
        }, {} as Omit<OverviewData, 'monthlyProperties' | 'monthlyTenants'>);

        return { ...overview, monthlyProperties: monthlyPropertiesData, monthlyTenants: monthlyTenantsData };
    } catch (error) {
        console.error("Error fetching data overview:", error);
        throw error;
    }
};



 


export const AdminService = {
    getALlPropertiesFromDB,
    getSinglePropertiesAllUnitsFromDB,
    getALlTenantsFormDB,
    getSingleTenantDetailseFromDB,
    getSingleOwnerAllPropertiesWithOwnerInfoFromDB,
    getAllDataOverviewByAdminFromDB
}