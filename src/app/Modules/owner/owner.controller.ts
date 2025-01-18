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