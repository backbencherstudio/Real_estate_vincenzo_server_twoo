import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { paymentService } from "./payment.service";


const stripeTenantPayment = catchAsync(async (req, res) => {
    const result = await paymentService.stripeTenantPaymentFun(req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Payment for this month has been successfully processed. please wait a moment for receipt ',
        data: result,
    });
});

const createALlTenantsForPayment = catchAsync(async (req, res) => {
    // const { ownerId } = req.params;
    const result = await paymentService.createAllTenantsForPaymentFormDB();    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'create tenant payment data successfully',
        data: result,
    });
});

const getAllTenantPaymentData = catchAsync(async (req, res) => {
    const result = await paymentService.getAllTenantPaymentDataFromDB();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'get all tenant payment data successfully',
        data: result,
    });
});

const getSingleUserAllPaymentData = catchAsync(async (req, res) => {    
    const result = await paymentService.getSingleUserAllPaymentDataFromDB(req.params.userId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'get all tenant payment data successfully',
        data: result,
    });
});

const createPayoutByOwner = catchAsync(async (req, res) => {    
    const result = await paymentService.createPayoutByOwnerIntoDB(req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Your payout request has been successfully placed. The transfer process may take 2-7 days. Please be patient during this time. Thank You!',
        data: result,
    });
});

const getPayoutDataByAdmin = catchAsync(async (req, res) => {    
    const result = await paymentService.getPayoutDataFromDBbyAdmin();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Get All PayOut Placed Data successfully by Admin',
        data: result,
    });
});

const getPayoutDataBySingleOwner = catchAsync(async (req, res) => {
    const { ownerId } = req.params;  
    const result = await paymentService.getPayoutDataFromDBbySingleOwner(ownerId); 
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Get all Payout data successfully by owner",
      data: result,
    });
  });


const sendPayoutRequestByOwnerToStripe = catchAsync(async (req, res) => {  
    const result = await paymentService.sendPayoutRequestByOwnerToStripe(req.body); 
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: result?.message,
      data: result?.result,
    });
  });

const sendPayoutRequestByAdmin = catchAsync(async (req, res) => {  
    const result = await paymentService.sendPayoutRequestByAdminToStripe(req.body); 
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: result?.message,
      data: result?.result,
    });
  });
  



export const paymentController = {
    stripeTenantPayment,
    createALlTenantsForPayment,
    getAllTenantPaymentData,
    getSingleUserAllPaymentData,
    createPayoutByOwner,
    getPayoutDataByAdmin,
    getPayoutDataBySingleOwner,
    sendPayoutRequestByOwnerToStripe,
    sendPayoutRequestByAdmin
}