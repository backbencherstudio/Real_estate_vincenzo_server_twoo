/* eslint-disable no-undef */
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { DocumentService } from "./document.service";

const createDocument = catchAsync(async (req, res) => {    
    if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ message: 'No files uploaded or invalid format' });
    }
    const image = req?.files?.map((file: Express.Multer.File) => `/uploads/${file.filename}`);
    const documetnData = {
        ...req.body,
        image: image[0]
    }
    const result = await DocumentService.createDocumentIntoDB(documetnData);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Your document has been successfully uploaded and is now pending approval from the owner",
        data: result,
    })
})


const getSingleOwnerAllDocuments = catchAsync(async (req, res) => {
    const result = await DocumentService.getSingleOwnerAllDocumentsFromDB(req.params.ownerId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "get all maintenance request successfully",
        data: result,
    })
})

const getSingleDocument = catchAsync(async (req, res) => {
    const result = await DocumentService.getSingleDocumentFromDB(req.params.documentId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "get document successfully",
        data: result,
    })
})

const getSingleUserAllDocuments = catchAsync(async (req, res) => {
    const result = await DocumentService.getSingleUserAllDocumentsFromDB(req.params.userId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "get document successfully",
        data: result,
    })
})

const findSingleTenentDocumentByOwner = catchAsync(async (req, res) => {
    const result = await DocumentService.findSingleTenentDocumentByOwnerFromDB(req.params.tenantId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "get single document successfully by owner",
        data: result,
    })
})





export const doculmentController = {
    createDocument,
    getSingleOwnerAllDocuments,
    getSingleDocument,
    getSingleUserAllDocuments,
    findSingleTenentDocumentByOwner
}