/* eslint-disable no-undef */
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

  // const realEstateAdvisor = catchAsync(async (req, res) => {
  //   if (!req.files || !Array.isArray(req.files)) {
  //     return res.status(400).json({ message: 'No files uploaded or invalid format' });
  //   }
  //   const advisorData = {
  //     ...req.body,
  //     image: req.files.map((file: Express.Multer.File) => `/uploads/${file.filename}`),
  //   };
  //   const result = await AdminService.RealEstateAdvisorIntoDB(advisorData);  
  //   sendResponse(res, {
  //     statusCode: httpStatus.OK,
  //     success: true,
  //     message: 'Non Subscriber user delete successfully',
  //     data: result,  
  //   });
  // });

  const realEstateAdvisor = catchAsync(async (req, res) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    const { name, designation, facebook, twitter, instagram, linkedin } = req.body;
    if (!name || !designation) {
        return res.status(400).json({ success: false, message: 'Name and Designation are required' });
    }
    const advisorData = {
        name,
        designation,
        facebook,
        twitter,
        instagram,
        linkedin,
        image: req.files.map((file) => `/uploads/${file.filename}`),
    };
    const result = await AdminService.RealEstateAdvisorIntoDB(advisorData);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Real Estate Advisor added successfully',
        data: result,
    });
});


 const realEstateAdvisordelete = catchAsync(async (req, res) => {
    const result = await AdminService.RealEstateAdvisordeleteIntoDB(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Real Estate Advisor Delete successfully',
        data: result,
    });
});

  const getAllReview = catchAsync(async (req, res) => {
    const result = await AdminService.getReviewFromDB();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Get all review successfully',
        data: result,
    });
});

  const deleteReviewByAdmin = catchAsync(async (req, res) => {
    const result = await AdminService.deleteReviewByAdminIntoDB(req.params.reviewId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Review delete successfully',
        data: result,
    });
});

  const getAllEmailCollectionData = catchAsync(async (req, res) => {
    const result = await AdminService.getAllEmailCollectionDataGetFromDB();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Get all email data successfully',
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
    deleteNoSubscriberOwner,
    realEstateAdvisor,
    realEstateAdvisordelete,
    getAllReview,
    deleteReviewByAdmin,
    getAllEmailCollectionData
}