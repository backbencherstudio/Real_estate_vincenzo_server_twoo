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


// const createUnitIntoDB = async (payload : TUnits )=>{
    
//     const isExists = await Properties.findById(payload.propertyId);
//     const isUserExists = await User.findById(payload.ownerId);
//     if(!isExists){
//         throw new AppError(httpStatus.NOT_FOUND, "Property not found")
//     }
//     if(!isUserExists){
//         throw new AppError(httpStatus.NOT_FOUND, "User not found")
//     }

//     const numberOfTotalUnits = typeof isUserExists.numberOfTotalUnits === 'string' ? parseFloat(isUserExists.numberOfTotalUnits) : isUserExists.numberOfTotalUnits;
//     const totalAmount = typeof isUserExists.totalAmount === 'string' ? parseFloat(isUserExists.totalAmount) : isUserExists.totalAmount;
//     const rent = typeof payload?.rent === 'string' ? parseFloat(payload.rent) : payload.rent;
//     const totalRent = typeof isExists.totalRent === 'string' ? parseFloat(isExists.totalRent) : isExists.totalRent;


//     if(isUserExists){
//                 await User.findByIdAndUpdate(
//                      {_id : payload.ownerId},
//                      {$set : { 
//                         numberOfTotalUnits : (numberOfTotalUnits || 0 ) + 1,
//                         totalAmount : ( totalAmount || 0) + rent
//                     }}
//                     )
//             }

//                 await Properties.findByIdAndUpdate({_id : payload.propertyId} , {
//                     $set : {
//                         totalRent : totalRent + rent,
//                         numberOfUnits : isExists.numberOfUnits + 1,
//                          }
//                 }  )
//      const result = await Unit.create(payload)
//      return result;
// }

const createUnitIntoDB = async (payload: TUnits) => {
    const session = await mongoose.startSession();
  
    try {
      session.startTransaction();
      const isExists = await Properties.findById(payload.propertyId.toString()).session(session);
      const isUserExists = await User.findById(payload.ownerId.toString()).session(session);
  
      if (!isExists) {
        throw new AppError(httpStatus.NOT_FOUND, "Property not found");
      }
  
      if (!isUserExists) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
      }
  
      const numberOfTotalUnits = parseFloat(isUserExists.numberOfTotalUnits?.toString()) || 0;
      const totalAmount = parseFloat(isUserExists.totalAmount?.toString()) || 0;
      const rent = parseFloat(payload?.rent?.toString()) || 0;
      const totalRent = parseFloat(isExists.totalRent?.toString()) || 0;
  
      await User.findByIdAndUpdate(
        payload.ownerId.toString(),
        {
          $set: {
            numberOfTotalUnits: numberOfTotalUnits + 1,
            totalAmount: totalAmount + rent,
          },
        },
        { session }
      );
  
      await Properties.findByIdAndUpdate(
        payload.propertyId.toString(),
        {
          $set: {
            totalRent: totalRent + rent,
            numberOfUnits: isExists.numberOfUnits + 1,
          },
        },
        { session }
      );  
      const result = await Unit.create([payload], { session });  

      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  };
  
  


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






// const createTenantIntoDB = async (payload: any) => {
//     const session = await mongoose.startSession();

//     try {
//         session.startTransaction();

//         // Fetch Unit and Property details
//         const [unit, property] = await Promise.all([
//             Unit.findById(payload?.unitId).select("booked rent").session(session),
//             Properties.findById(payload?.propertyId).session(session),
//         ]);

//         if (!property) throw new AppError(httpStatus.EXPECTATION_FAILED, "Property not found");
//         if (unit?.booked) throw new AppError(httpStatus.EXPECTATION_FAILED, "This unit is already booked");

//         // Hash password and prepare user data
//         const password = await bcrypt.hash(payload.password, 8);
//         const { name, email, role, isDeleted, ...allIds } = payload;
//         const userData = { email, name, role, password, isDeleted };

//         // Create user and tenant in one transaction
//         const [user] = await User.create([userData], { session });
//         const tenantData = { userId: user._id, ...allIds };
//         const [tenant] = await Tenant.create([tenantData], { session });

//         // Update Unit as booked
//         await Unit.findByIdAndUpdate(payload.unitId, { booked: true }, { session });

//         // Update owner's total rent and booked units
//         const owner = await User.findById(payload.ownerId).session(session);
//         if (owner && unit?.rent) {
//             const totalRentAmount = (parseFloat(owner.totalRentAmount) || 0) + unit.rent;
//             const bookedUnitNumber = (parseFloat(owner.bookedUnitNumber) || 0) + 1;
//             await User.findByIdAndUpdate(
//                 payload.ownerId,
//                 { $set: { totalRentAmount, bookedUnitNumber } },
//                 { session }
//             );
//         }

//         // Update Property's booked rent and units
//         if (unit?.rent) {
//             const totalBookedRent = (parseFloat(property.totalBookedRent) || 0) + unit.rent;
//             const numberOfBookedUnits = (parseFloat(property.numberOfBookedUnits) || 0) + 1;
//             await Properties.findByIdAndUpdate(
//                 payload.propertyId,
//                 { $set: { totalBookedRent, numberOfBookedUnits } },
//                 { session }
//             );
//         }

//         // Populate tenant details for the response
//         const populatedTenant = await Tenant.findById(tenant._id)
//             .populate([
//                 { path: "ownerId" },
//                 { path: "propertyId" },
//                 { path: "unitId" },
//                 { path: "userId" },
//             ])
//             .session(session);

//         await session.commitTransaction();
//         return populatedTenant;

//     } catch (error: any) {
//         await session.abortTransaction();
//         throw new Error(error.message || "Error occurred during transaction");
//     } finally {
//         session.endSession();
//     }
// };



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