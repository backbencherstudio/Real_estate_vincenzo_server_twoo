import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { OwnerServices } from "./owner.service";


const createProperties = catchAsync(async (req, res) => {
    const { propertyData } = req.body;     
    const result = await OwnerServices.createPropertiesDB(propertyData);  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Property create successfully',
      data: result,  
    });
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
    const { unitData } = req.body;
    
    const result = await OwnerServices.createUnitIntoDB(unitData);  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Create unit successfully',
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
    const { tenantData } = req.body;     
    const result = await OwnerServices.createTenantIntoDB(tenantData);  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Tenant create successfully',
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
  

 export const propertyController  = {
    createProperties,
    getSingleOwnerAllProperties,
    createUnits,
    getEachPropertyAllUnits,
    getSingleUnit,
    createTenant,
    getAllTenants,
    getSingleTenant
 }