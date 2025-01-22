/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Query, Types } from "mongoose";
import { User } from "../User/user.model";
import { TProperties, TUnits } from "./owner.interface";
import { Properties, Tenant, Unit } from "./owner.module";
import bcrypt from 'bcrypt';
import { AppError } from "../../errors/AppErrors";
import httpStatus from "http-status";
import { Maintenance } from "../maintenance/maintenance.module";
import { OverviewData } from "../admin/admin.interface";


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

const getSingleOwnerAllPropertiesFromDB = async (id: string) => {
  const result = await Properties.find({ ownerId: id }).sort({ createdAt: -1 })
  return result
}

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

const getSinglePropertiesAllUnitsFromDB = async (id: string) => {
  const property = await Properties.findById({ _id: id });
  const allUnits = await Unit.find({ propertyId: id });
  const result = {
    property,
    allUnits
  }
  return result
}

const getSingleUnitFormDB = async (id: string) => {
  const result = await Unit.findById({ _id: id }).populate({ path: "propertyId", populate: { path: "ownerId" } });
  return result
}

const createTenantIntoDB = async (payload: any) => {

  const isExists = await Unit.findById(payload?.unitId).select("booked");
  const isPropertiesExists = await Properties.findById(payload?.propertyId);

  if (isExists?.booked) {
    throw new AppError(httpStatus.EXPECTATION_FAILED, "This unit already booked");
  }
  if (!isPropertiesExists) {
    throw new AppError(httpStatus.EXPECTATION_FAILED, "Properties not found");
  }
  const { name, email, role, password: pass, isDeleted, ...allIds } = payload;

  const password = await bcrypt.hash(pass, 8);
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
    const unitResult = await Unit.findByIdAndUpdate({ _id: payload.unitId }, { booked: true }, { session })
    const populatedTenant = await Tenant.findById(tenantResult[0]._id)
      .populate([{ path: "ownerId" }, { path: "propertyId" }, { path: "unitId" }, { path: "userId" }])
      .session(session);


    // =============== >>>  totalAmount update in User module

    const userDataMain = await User.findById({ _id: payload.ownerId });
    const totalRentAmount = typeof userDataMain?.totalRentAmount === 'string' ? parseFloat(userDataMain?.totalRentAmount) : userDataMain?.totalRentAmount;
    const rent = typeof unitResult?.rent === 'string' ? parseFloat(unitResult?.rent) : unitResult?.rent;
    const bookedUnitNumber = typeof userDataMain?.bookedUnitNumber === 'string' ? parseFloat(userDataMain?.bookedUnitNumber) : userDataMain?.bookedUnitNumber;

    if (userDataMain && unitResult && rent) {
      await User.findByIdAndUpdate(
        { _id: payload.ownerId },
        {
          $set: {
            totalRentAmount: (totalRentAmount || 0) + rent,
            bookedUnitNumber: (bookedUnitNumber || 0) + 1
          },
        }
      );
    }

    const totalBookedRent = typeof isPropertiesExists.totalBookedRent === 'string' ? parseFloat(isPropertiesExists.totalBookedRent) : isPropertiesExists.totalBookedRent;
    const numberOfBookedUnits = typeof isPropertiesExists.numberOfBookedUnits === 'string' ? parseFloat(isPropertiesExists.numberOfBookedUnits) : isPropertiesExists.numberOfBookedUnits;


    if (unitResult && rent) {
      await Properties.findByIdAndUpdate({ _id: payload.propertyId }, {
        $set: {
          totalBookedRent: totalBookedRent + rent,
          numberOfBookedUnits: numberOfBookedUnits + 1,
        }
      })
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

const getAllTenantsIntoDB = async (id: string) => {
  const result = await Tenant.find({ ownerId: id }).populate([{ path: "userId" }, { path: "propertyId" }, { path: "unitId" }]);
  return result
}

const getSingleTenantFormDB = async (id: string) => {
  const result = await Tenant.findById({ _id: id }).populate("userId");
  return result
}

const getEachOwnerAllMaintenanceRequestFromDB = async (id: string) => {
  const result = await Maintenance.find({ ownerId: id }).sort({ createdAt: -1 })
  return result
}

const getSingleMaintenanceRequestDataFromDB = async (id: string) => {
  const result = await Maintenance.findById({ _id: id }).populate("userId")
  return result
}

const maintenanceStatusChengeIntoDB = async (id: string, status: string) => {
  const result = await Maintenance.findByIdAndUpdate({ _id: id }, { status: status }, { new: true, runValidators: true })
  return result
}


const getAllDataOverviewByOwnerFromDB = async (ownerId: string): Promise<OverviewData> => {
  try {
    const queries: { key: keyof Omit<OverviewData, 'monthlyProperties' | 'monthlyTenants'>; query: Query<number, any> }[] = [
      { key: "propertyLength", query: Properties.countDocuments({ ownerId }) },
      { key: "tenantLength", query: Tenant.countDocuments({ ownerId }) },
      { key: "unitsLength", query: Unit.countDocuments({ ownerId }) },
    ];
    const results = await Promise.all(queries.map(item => item.query));
    const monthlyProperties = await Properties.aggregate([
      {
        $match: {
          ownerId: new Types.ObjectId(ownerId) 
        }
      },
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
        $match: {
          ownerId: new Types.ObjectId(ownerId) 
        }
      },
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



export const OwnerServices = {
  createPropertiesDB,
  getSingleOwnerAllPropertiesFromDB,
  createUnitIntoDB,
  getSinglePropertiesAllUnitsFromDB,
  getSingleUnitFormDB,
  createTenantIntoDB,
  getAllTenantsIntoDB,
  getSingleTenantFormDB,
  getEachOwnerAllMaintenanceRequestFromDB,
  getSingleMaintenanceRequestDataFromDB,
  maintenanceStatusChengeIntoDB,
  getAllDataOverviewByOwnerFromDB
};