/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { User } from "../User/user.model";
import {  TProperties, TUnits } from "./owner.interface";
import { Properties, Tenant, Unit } from "./owner.module";
import bcrypt from 'bcrypt'; 
import { AppError } from "../../errors/AppErrors";
import httpStatus from "http-status";

// const createPropertiesDB = async (payload: TProperties) => {
//     const isExists = await Properties.findOne({ houseNumber : payload.houseNumber})
//     if(isExists){
//         throw new AppError(httpStatus.ALREADY_REPORTED, "Property already exixts")
//     }    
//     const result = await Properties.create(payload);
//     const userData  = await User.findById({_id : payload.ownerId})

//     if(userData){
//         await User.findByIdAndUpdate(
//              {_id : payload.ownerId},
//              {numberOfProperty : userData?.numberOfProperty + 1, numberOfTotalUnits : userData.numberOfTotalUnits +  payload.numberOfUnits }
//              )
//     }
//     return result;
// };

const createPropertiesDB = async (payload: TProperties) => {
    const result = await Properties.create(payload);
    const userData = await User.findById({ _id: payload.ownerId });
    if (userData) {
        await User.findByIdAndUpdate(
            { _id: payload.ownerId },
            {
                $set: {
                    numberOfProperty: (userData?.numberOfProperty || 0) + 1,
                },
            }
        );
    }
    return result;
};


const getSingleOwnerAllPropertiesFromDB = async(id : string ) =>{
    const result = await Properties.find({ownerId : id }).sort({createdAt : -1})    
    return result    
}


const createUnitIntoDB = async (payload : TUnits )=>{
    
    const isExists = await Properties.findById(payload.propertyId);
    const isUserExists = await User.findById(payload.ownerId);
    if(!isExists){
        throw new AppError(httpStatus.NOT_FOUND, "Property not found")
    }
    if(!isUserExists){
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }
    if(isUserExists){
                await User.findByIdAndUpdate(
                     {_id : payload.ownerId},
                     {$set : { 
                        numberOfTotalUnits : (parseInt(isUserExists.numberOfTotalUnits) || 0 ) + 1,
                        totalAmount : ( parseInt(isUserExists.totalAmount) || 0) + parseInt(payload?.rent)
                    }}
                    )
            }

                await Properties.findByIdAndUpdate({_id : payload.propertyId} , {
                    $set : {
                        totalRent : parseInt(isExists.totalRent.toString()) + parseInt(payload?.rent.toString()),
                        numberOfUnits : isExists.numberOfUnits + 1,
                         }
                }  )
     const result = await Unit.create(payload)
     return result;
}

const getSinglePropertiesAllUnitsFromDB = async(id : string ) =>{
    const property = await Properties.findById({_id : id});
    const allUnits = await Unit.find({propertyId : id });
    const result = {
        property,
        allUnits
    }
    return result    
}

const getSingleUnitFormDB = async (id : string)=>{
    const result = await Unit.findById({_id : id }).populate({ path : "propertyId", populate : {path : "ownerId"} });
    return result
}

const createTenantIntoDB = async (payload: any) => {
    const isExists = await Unit.findById(payload?.unitId).select("booked");
    const isPropertiesExists = await Properties.findById(payload?.propertyId);
    if(isExists?.booked){
        throw new AppError(httpStatus.EXPECTATION_FAILED, "This unit already booked");
    }
    if(!isPropertiesExists){
        throw new AppError(httpStatus.EXPECTATION_FAILED, "Properties not found");
    }
    const { name, email, role, password : pass , isDeleted, ...allIds } = payload;   
    const password = await bcrypt.hash(pass, 8 );
    const userData = { email, name, role, password, isDeleted };
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const userResult = await User.create([userData], { session });
        const userId = userResult[0]?._id;
        const tenantData = {
            userId,
            ...allIds
        };
        const tenantResult = await Tenant.create([tenantData], { session });
        const unitResult = await Unit.findByIdAndUpdate({_id : payload.unitId}, {booked : true}, {session} )
        const populatedTenant = await Tenant.findById(tenantResult[0]._id)
            .populate([{ path: "ownerId" }, { path: "propertyId" }, { path: "unitId" }, {path : "userId"}])
            .session(session);

            
    // =============== >>>  totalAmount update in User module
    const userDataMain = await User.findById({ _id: payload.ownerId });
    if (userDataMain && unitResult ) {
        await User.findByIdAndUpdate(
            { _id: payload.ownerId },
            {
                $set: {
                    totalRentAmount : ( parseInt(userDataMain?.totalRentAmount) || 0 ) + parseInt(unitResult?.rent) ,
                    bookedUnitNumber : ( parseInt(userDataMain?.bookedUnitNumber) || 0 ) + 1
                },
            }
        );
    }
    if(unitResult){
        await Properties.findByIdAndUpdate({_id : payload.propertyId} , {
            $set : {
                 totalBookedRent : parseInt(isPropertiesExists.totalBookedRent) + parseInt(unitResult?.rent),
                 numberOfBookedUnits : parseInt(isPropertiesExists.numberOfBookedUnits) + 1,
                 }
        }  )
    }
        await session.commitTransaction();
        await session.endSession();
        return populatedTenant;

    } catch (error: any) {
        await session.abortTransaction();
        await session.endSession();
        throw new Error(error.message || "Error occurred during transaction");
    }
};

const getAllTenantsIntoDB = async (id : string) =>{   
    const result = await Tenant.find({ownerId : id}).populate([ {path : "userId"}, {path : "propertyId"}, {path : "unitId"} ]);
    return result
}

const getSingleTenantFormDB = async (id : string)=>{
    const result = await Tenant.findById({_id : id}).populate("userId");
    return result
}

export const OwnerServices = {
    createPropertiesDB ,
    getSingleOwnerAllPropertiesFromDB,
    createUnitIntoDB,
    getSinglePropertiesAllUnitsFromDB,
    getSingleUnitFormDB,
    createTenantIntoDB,
    getAllTenantsIntoDB,
    getSingleTenantFormDB
  };