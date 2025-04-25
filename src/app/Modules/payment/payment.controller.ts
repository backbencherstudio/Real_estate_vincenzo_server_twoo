import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { paymentService } from "./payment.service";


const stripeTenantPayment = catchAsync(async (req, res) => {
    const result = await paymentService.stripeTenantPaymentFun(req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Payment for this month has been successfully processed. please wait a moment for receipt',
        data: result,
    });
});

const createCustomerForACHpayment = catchAsync(async (req, res) => {
    const result = await paymentService.createCustomerService(req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Customer create successfully',
        data: result,
    });
});

const createBankTokenForACHpayment = catchAsync(async (req, res) => {
    const result = await paymentService.createBankTokenService(req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Token crate successfully',
        data: result,
    });
});

const attachACHbankAccount = catchAsync(async (req, res) => {    
    const result = await paymentService.attachACHbankAccountService(req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Your bank has been successfully linked. Please allow up to some moment or 1-2 business days for the verification amount to be sent for confirmation. Thank you for your patience.',
        data: result,
    });
});

const verifyBankAccount = catchAsync(async (req, res) => {    
    const result = await paymentService.verifyBankAccountService(req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Verify Bank successfully',
        data: result,
    });
});

const payRentUserACHcontroller = catchAsync(async (req, res) => {    
    const result = await paymentService.payRentService(req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Your payment for this month has been successfully processed. The receipt will be delivered within 4–5 business days. We kindly ask for your patience during this time.',
        data: result,
    });
});

const createALlTenantsForPayment = catchAsync(async (req, res) => {    
    const result = await paymentService.createAllTenantsForPaymentFormDB(req.params.ownerId);    
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

  
const planController = catchAsync(async (req, res) => {  
    const result = await paymentService.planService(req.body); 
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message:"Plan placed successfully",
      data: result,
    });
  });
  

const remindersTenantDueRentEmailNotificationController = catchAsync(async (req, res) => {  
    const result = await paymentService.remindersTenantDueRentEmailNotification(req.params.ownerId); 
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message:"Tenant Due Rent Email Notification Reminder send successfully",
      data: result,
    });
  });
  



export const paymentController = {
    stripeTenantPayment,
    createCustomerForACHpayment,
    createBankTokenForACHpayment,
    attachACHbankAccount,
    verifyBankAccount,
    payRentUserACHcontroller,
    createALlTenantsForPayment,
    getAllTenantPaymentData,
    getSingleUserAllPaymentData,
    createPayoutByOwner,
    getPayoutDataByAdmin,
    getPayoutDataBySingleOwner,
    sendPayoutRequestByOwnerToStripe,
    sendPayoutRequestByAdmin,
    planController,
    remindersTenantDueRentEmailNotificationController
}