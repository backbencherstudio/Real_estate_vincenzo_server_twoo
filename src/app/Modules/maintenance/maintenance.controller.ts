/* eslint-disable no-undef */
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { MaintenanceService } from "./maintenance.service";


const createMaintenance = catchAsync(async (req, res) => {

    if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ message: 'No files uploaded or invalid format' });
    }
    const image = req?.files?.map((file: Express.Multer.File) => `/uploads/${file.filename}`);
    const maintenanceData = {
        ...req.body,
        image: image[0]
    }
    
    const result = await MaintenanceService.createMaintenanceIntoDB(maintenanceData);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Maintenance request send successfully",
        data: result,
    })
})



const getAllMaintenanceRequest = catchAsync(async (req, res) => {
    const result = await MaintenanceService.getAllMaintenanceRequestFromDB(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "get all maintenance request successfully",
        data: result,
    })
})





export const maintenanceController = {
    createMaintenance,
    getAllMaintenanceRequest
}