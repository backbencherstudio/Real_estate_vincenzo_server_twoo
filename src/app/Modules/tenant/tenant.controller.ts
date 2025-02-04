import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TenantService } from "./tenant.service";

const getTenantDetails = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await TenantService.getTenantDetailsFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Get tenant data successfully',
        data: result,
    });
});


const getAllTenantsForMessageForEachPropertyTenant = catchAsync(async (req, res) => {
    const { id } = req.params;    
    const result = await TenantService.getAllTenantsForMessageFromDBForEachPropertyTenant(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Get tenant message data successfully for each user per property',
        data: result,
    });
});

export const tenantController = {
    getTenantDetails,
    getAllTenantsForMessageForEachPropertyTenant
}