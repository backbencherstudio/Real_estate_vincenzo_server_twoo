/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Query, Types } from "mongoose";
import { User } from "../User/user.model";
import { PopulatedPayment, TProperties, TUnits } from "./owner.interface";
import { Properties, Tenant, Unit } from "./owner.module";
import bcrypt from 'bcrypt';
import { AppError } from "../../errors/AppErrors";
import httpStatus from "http-status";
import { Maintenance } from "../maintenance/maintenance.module";
import { OverviewData } from "../admin/admin.interface";
import { TenantPayment } from "../payment/payment.module";
import { Document } from "../document/document.module";


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

const deleteUnitFormDB = async (unitId : string )=>{

  console.log(unitId);
  
}

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
  const userData = { email, name, role, password, isDeleted, isSecurityDepositPay: false };
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

// const deleteTenantIntoDB = async (id: string) => {
//   const tenantData = await Tenant.findById({ _id: id })
//   if (!tenantData) {
//     throw new AppError(httpStatus.NOT_FOUND, "Tenant Not Found")
//   }

//   const unitId = tenantData.unitId;   //( booked : false )
//   const ownerId = tenantData.ownerId;  // ( bookedUnitNumber - 1,,, totalRentAmount - unit.rent )
//   const userId = tenantData.userId;     // ( delete user --->> Tenant )
//   const propertyId = tenantData.propertyId;  // ( numberOfBookedUnits - 1,,,  totalBookedRent - unit.rent )

//   const unitData = await Unit.findById({ _id: unitId })
//   const ownerData = await User.findById({ _id: ownerId })
//   const propertyData = await Properties.findById({ _id: propertyId })

//   await User.findByIdAndUpdate({ _id: ownerId }, {
//     bookedUnitNumber: (ownerData?.bookedUnitNumber as number) - 1,
//     totalRentAmount: (ownerData?.totalRentAmount as number) - (unitData?.rent as number)
//   })


//   await Unit.findByIdAndUpdate({ _id: unitId }, { booked: false });
//   await Properties.findByIdAndUpdate({ _id: propertyId }, {
//     numberOfBookedUnits: (propertyData?.numberOfBookedUnits as number) - 1,
//     totalBookedRent: (propertyData?.totalBookedRent as number) - (unitData?.rent as number)
//   });
  
//   await User.findByIdAndDelete({ _id: userId })
//   await TenantPayment.deleteMany({ userId })
//   await Document.deleteMany({ userId })
//   await Maintenance.deleteMany({ userId })
//   await Tenant.findOneAndDelete({ userId })



//   return true

// }

const deleteTenantIntoDB = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const tenantData = await Tenant.findById({ _id: id }).session(session);
    if (!tenantData) {
      throw new AppError(httpStatus.NOT_FOUND, "Tenant Not Found");
    }

    const unitId = tenantData.unitId; //( booked : false )
    const ownerId = tenantData.ownerId; //( bookedUnitNumber - 1,,, totalRentAmount - unit.rent )
    const userId = tenantData.userId; //( delete user --->> Tenant )
    const propertyId = tenantData.propertyId; //( numberOfBookedUnits - 1,,, totalBookedRent - unit.rent )

    const unitData = await Unit.findById({ _id: unitId }).session(session);
    const ownerData = await User.findById({ _id: ownerId }).session(session);
    const propertyData = await Properties.findById({ _id: propertyId }).session(session);

    if (!unitData || !ownerData || !propertyData) {
      throw new AppError(httpStatus.NOT_FOUND, "Related entity not found");
    }

    await User.findByIdAndUpdate(
      { _id: ownerId },
      {
        bookedUnitNumber: (ownerData?.bookedUnitNumber as number) - 1,
        totalRentAmount: (ownerData?.totalRentAmount as number) - (unitData?.rent as number),
      },
      { session }
    );

    await Unit.findByIdAndUpdate({ _id: unitId }, { booked: false }, { session });

    await Properties.findByIdAndUpdate(
      { _id: propertyId },
      {
        numberOfBookedUnits: (propertyData?.numberOfBookedUnits as number) - 1,
        totalBookedRent: (propertyData?.totalBookedRent as number) - (unitData?.rent as number),
      },
      { session }
    );

    await User.findByIdAndDelete({ _id: userId }, { session });
    await TenantPayment.deleteMany({ userId }).session(session);
    await Document.deleteMany({ userId }).session(session);
    await Maintenance.deleteMany({ userId }).session(session);
    await Tenant.findOneAndDelete({ userId }).session(session);

    await session.commitTransaction();
    session.endSession();

    return true;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
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

const getResentPaymentDataByOwnerFromDB = async (ownerId: string, status: string) => {
  const result = await TenantPayment.find({ ownerId, status }).populate([{ path: "propertyId" }, { path: "unitId" }, { path: "userId" }]).sort({ updatedAt: -1 })
  return result
}

const getPaymentDataOverviewByOwnerFromDB = async (ownerId: string, selectedDate: string) => {
  const [year, month] = selectedDate.split("-").map(Number);
  const payments: PopulatedPayment[] = await TenantPayment.find({
    ownerId,
    status: { $in: ["Pending", "Paid"] },
    createdAt: {
      $gte: new Date(year, month - 1, 1),
      $lt: new Date(year, month, 1)
    }
  })
    .populate<{ unitId: { rent?: number } }>("unitId", "rent")
    .lean();

  let totalDueRentAmount = 0;
  let totalPaidRentAmount = 0;

  payments.forEach((payment) => {
    if (payment.status === "Pending") {
      totalDueRentAmount += payment.unitId?.rent ?? 0;
    } else if (payment.status === "Paid") {
      totalPaidRentAmount += payment.paidAmount ?? 0;
    }
  });

  return {
    totalDueRentAmount,
    totalPaidRentAmount
  };
};

const getAllTenantsForMessageFromDB = async (id: string) => {
  const tenant = await Tenant.find({ ownerId: id })
    .populate({ path: "userId", select: "name email role profileImage" });
  const admin = await User.find({ role: "admin" }).select("name email role profileImage");
  return [...tenant.map(t => t.userId), ...admin];
};



export const OwnerServices = {
  createPropertiesDB,
  getSingleOwnerAllPropertiesFromDB,
  createUnitIntoDB,
  deleteUnitFormDB,
  getSinglePropertiesAllUnitsFromDB,
  getSingleUnitFormDB,
  createTenantIntoDB,
  deleteTenantIntoDB,
  getAllTenantsIntoDB,
  getSingleTenantFormDB,
  getEachOwnerAllMaintenanceRequestFromDB,
  getSingleMaintenanceRequestDataFromDB,
  maintenanceStatusChengeIntoDB,
  getAllDataOverviewByOwnerFromDB,
  getResentPaymentDataByOwnerFromDB,
  getPaymentDataOverviewByOwnerFromDB,
  getAllTenantsForMessageFromDB
};