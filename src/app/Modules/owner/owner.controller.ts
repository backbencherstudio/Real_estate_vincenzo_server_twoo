/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { OwnerServices } from "./owner.service";



const createProperties = catchAsync(async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ message: 'No files uploaded or invalid format' });
    }

    const propertyData = {
      ...req.body,
      availableParking: req.body.availableParking === 'true',
      propertyLocation: JSON.parse(req.body.propertyLocation),
      propertyImages: req.files.map((file: Express.Multer.File) => `/uploads/${file.filename}`),
    };

    const result = await OwnerServices.createPropertiesDB(propertyData);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Property created successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const getSingleOwnerAllProperties = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await OwnerServices.getSingleOwnerAllPropertiesFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Get Single Owner All Property successfully',
    data: result,
  });
});

const createUnits = catchAsync(async (req, res) => {
  const result = await OwnerServices.createUnitIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Create unit successfully',
    data: result,
  });
});

const deleteUnit = catchAsync(async (req, res) => {
  const result = await OwnerServices.deleteUnitFormDB(req.params.unitId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Unit delete successfully',
    data: result,
  });
});

const getEachPropertyAllUnits = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await OwnerServices.getSinglePropertiesAllUnitsFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Get Each Property all units successfully',
    data: result,
  });
});

const getSingleUnit = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await OwnerServices.getSingleUnitFormDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Get single units successfully',
    data: result,
  });
});

const createTenant = catchAsync(async (req, res) => {
  const result = await OwnerServices.createTenantIntoDB(req?.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Tenant create successfully',
    data: result,
  });
});

const deleteTenant = catchAsync(async (req, res) => {
  const result = await OwnerServices.deleteTenantIntoDB(req?.params?.tenantId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Tenant delete successfully',
    data: result,
  });
});

const getAllTenants = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await OwnerServices.getAllTenantsIntoDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Tenant/unit get successfully',
    data: result,
  });
});

const getSingleTenant = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await OwnerServices.getSingleTenantFormDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'get single tenant successfully',
    data: result,
  });
});

const getEachOwnerAllMaintenanceRequestData = catchAsync(async (req, res) => {
  const { ownerId } = req.params;
  const result = await OwnerServices.getEachOwnerAllMaintenanceRequestFromDB(ownerId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'get single Owner All Maintenance Data successfully',
    data: result,
  });
});


const getSingleMaintenanceRequestData = catchAsync(async (req, res) => {
  const { maintainId } = req.params;
  const result = await OwnerServices.getSingleMaintenanceRequestDataFromDB(maintainId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'get single Maintenance Data successfully',
    data: result,
  });
});


const maintenanceStatusChenge = catchAsync(async (req, res) => {
  const { maintainId } = req.params;
  const result = await OwnerServices.maintenanceStatusChengeIntoDB(maintainId, req.body.status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'status change successfully',
    data: result,
  });
});

const getAllDataOverviewByOwner = catchAsync(async (req, res) => {
  const { ownerId } = req.params;
  const result = await OwnerServices.getAllDataOverviewByOwnerFromDB(ownerId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'get all overview data successfully',
    data: result,
  });
});

const getResentPaymentDataByOwner = catchAsync(async (req, res) => {
  const { ownerId } = req.params;
  const { status } = req.query;
  const result = await OwnerServices.getResentPaymentDataByOwnerFromDB(ownerId, status as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'get all resent payment data successfully',
    data: result,
  });
});


// const getPaymentDataOverviewByOwner = catchAsync(async (req, res) => {
//   const { ownerId } = req.params;
//   const { date } = req.query;

//   console.log(ownerId);
//   console.log(date);
  
//   const result = await OwnerServices.getPaymentDataOverviewByOwnerFromDB(ownerId, date as string);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'get payment overview data successfully',
//     data: result,
//   });
// });

const getPaymentDataOverviewByOwner = catchAsync(async (req, res) => {
  const { ownerId } = req.params;
  const { selectedDate } = req.query; 

  if (!selectedDate) {
    return res.status(400).json({ success: false, message: "Missing selectedDate parameter" });
  }
  const result = await OwnerServices.getPaymentDataOverviewByOwnerFromDB(ownerId, selectedDate as string); 
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Get payment overview data successfully",
    data: result,
  });
});

const getAllTenantsForMessage = catchAsync(async (req, res) => {
  const { ownerId } = req.params;
  const result = await OwnerServices.getAllTenantsForMessageFromDB(ownerId); 
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Get all tenant data successfully by owner",
    data: result,
  });
});


export const propertyController = {
  createProperties,
  getSingleOwnerAllProperties,
  createUnits,
  deleteUnit,
  getEachPropertyAllUnits,
  getSingleUnit,
  createTenant,
  deleteTenant,
  getAllTenants,
  getSingleTenant,
  getEachOwnerAllMaintenanceRequestData,
  getSingleMaintenanceRequestData,
  maintenanceStatusChenge,
  getAllDataOverviewByOwner,
  getResentPaymentDataByOwner,
  getPaymentDataOverviewByOwner,
  getAllTenantsForMessage,
}