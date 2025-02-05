import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { AdminService } from "./admin.service";
import sendResponse from "../../utils/sendResponse";


const getALlProperties = catchAsync(async (req, res) => {
    const result = await AdminService.getALlPropertiesFromDB()  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: ' get all properties successfully ',
      data: result,  
    });
  });

  const getEachPropertyAllUnits = catchAsync(async (req, res) => {
    const { id } = req.params; 
    const result = await AdminService.getSinglePropertiesAllUnitsFromDB(id);  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Get Each Property all units successfully',
      data: result,  
    });
  });

  const getALlTenants = catchAsync(async (req, res) => {
    const result = await AdminService.getALlTenantsFormDB();  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Get All tenant successfully',
      data: result,  
    });
  });

  const getSingleTenantDetailse = catchAsync(async (req, res) => {
    const result = await AdminService.getSingleTenantDetailseFromDB(req.params.id);  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Get All tenant successfully',
      data: result,  
    });
  });

  const getSingleOwnerAllPropertiesWithOwnerInfo = catchAsync(async (req, res) => {
    const result = await AdminService.getSingleOwnerAllPropertiesWithOwnerInfoFromDB(req.params.id);  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Get Single Owner All Properties With Owner Info successfully',
      data: result,  
    });
  });


  const getAllDataOverviewByAdmin = catchAsync(async (req, res) => {
    const result = await AdminService.getAllDataOverviewByAdminFromDB();  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Get All Data Overview successfully',
      data: result,  
    });
  });

  const createPlan = catchAsync(async (req, res) => {
    const result = await AdminService.createPlanIntoDB(req.body);  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Get All Data Overview successfully',
      data: result,  
    });
  });


 

export const AdminController = {
    getALlProperties,
    getEachPropertyAllUnits,
    getALlTenants,
    getSingleTenantDetailse,
    getSingleOwnerAllPropertiesWithOwnerInfo,
    getAllDataOverviewByAdmin,
    createPlan
}