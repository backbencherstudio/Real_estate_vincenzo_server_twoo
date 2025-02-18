import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { AdminService } from "./admin.service";
import sendResponse from "../../utils/sendResponse";


const getALlProperties = catchAsync(async (req, res) => {
  const {selectedDate} = req.query
    const result = await AdminService.getALlPropertiesFromDB(selectedDate as string )  
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
    const {selectedDate} = req.query;
    const result = await AdminService.getAllDataOverviewByAdminFromDB(selectedDate as string);  
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
      message: 'Plan Created successfully',
      data: result,  
    });
  });

  const getPlan = catchAsync(async (req, res) => {    
    const result = await AdminService.getPlanFromDB();  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Plan Get successfully',
      data: result,  
    });
  });

  const deleteNoSubscriberOwner = catchAsync(async (req, res) => {    
    const result = await AdminService.deleteNoSubscriberOwnerFormDB(req.params.ownerId);  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Non Subscriber user delete successfully',
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
    createPlan,
    getPlan,
    deleteNoSubscriberOwner
}