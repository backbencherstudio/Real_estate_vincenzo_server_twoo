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

    const numberOfTotalUnits = typeof isUserExists.numberOfTotalUnits === 'string' ? parseFloat(isUserExists.numberOfTotalUnits) : isUserExists.numberOfTotalUnits;
    const totalAmount = typeof isUserExists.totalAmount === 'string' ? parseFloat(isUserExists.totalAmount) : isUserExists.totalAmount;
    const rent = typeof payload?.rent === 'string' ? parseFloat(payload.rent) : payload.rent;
    const totalRent = typeof isExists.totalRent === 'string' ? parseFloat(isExists.totalRent) : isExists.totalRent;


    if(isUserExists){
                await User.findByIdAndUpdate(
                     {_id : payload.ownerId},
                     {$set : { 
                        numberOfTotalUnits : (numberOfTotalUnits || 0 ) + 1,
                        totalAmount : ( totalAmount || 0) + rent
                    }}
                    )
            }

                await Properties.findByIdAndUpdate({_id : payload.propertyId} , {
                    $set : {
                        totalRent : totalRent + rent,
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
    const totalRentAmount = typeof userDataMain?.totalRentAmount === 'string' ? parseFloat(userDataMain?.totalRentAmount) : userDataMain?.totalRentAmount;
    const rent = typeof unitResult?.rent === 'string' ? parseFloat(unitResult?.rent) : unitResult?.rent;
    const bookedUnitNumber = typeof userDataMain?.bookedUnitNumber === 'string' ? parseFloat(userDataMain?.bookedUnitNumber) : userDataMain?.bookedUnitNumber;
    
    if (userDataMain && unitResult && rent ) {
        await User.findByIdAndUpdate(
            { _id: payload.ownerId },
            {
                $set: {
                    totalRentAmount : ( totalRentAmount || 0 ) + rent ,
                    bookedUnitNumber : ( bookedUnitNumber || 0 ) + 1
                },
            }
        );
    }

    const totalBookedRent = typeof isPropertiesExists.totalBookedRent === 'string' ? parseFloat(isPropertiesExists.totalBookedRent) :isPropertiesExists.totalBookedRent;
    const numberOfBookedUnits = typeof isPropertiesExists.numberOfBookedUnits === 'string' ? parseFloat(isPropertiesExists.numberOfBookedUnits) :isPropertiesExists.numberOfBookedUnits;
    

    if(unitResult && rent ){
        await Properties.findByIdAndUpdate({_id : payload.propertyId} , {
            $set : {
                 totalBookedRent : totalBookedRent + rent,
                 numberOfBookedUnits : numberOfBookedUnits + 1,
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