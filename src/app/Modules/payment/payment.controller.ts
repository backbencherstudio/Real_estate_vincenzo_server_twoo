import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { paymentService } from "./payment.service";


const createALlTenantsForPayment = catchAsync(async (req, res) => {
    // const { ownerId } = req.params;
    const result = await paymentService.createALlTenantsForPaymentFormDB();
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


export const paymentController = {
    createALlTenantsForPayment,
    getAllTenantPaymentData
}