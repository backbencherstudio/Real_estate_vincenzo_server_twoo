import httpStatus from "http-status";
import { AppError } from "../../errors/AppErrors";
import { Tenant } from "../owner/owner.module";
import { TDocument } from "./document.interface";
import { Document, TPopulatedTenant } from "./document.module";


const createDocumentIntoDB = async (payload: TDocument) => {
    const userId = (await Tenant.findOne({ userId: payload.userId })
    .populate([
      { path: "unitId" },
      { path: "userId" },
      { path: "propertyId" },
    ])
    .exec()) as TPopulatedTenant | null;
    if(!userId){
        throw new AppError(httpStatus.NOT_FOUND, "User Not exists")
    }    
    const documentData = {
        tenantId : userId._id,
        userId: payload.userId,
        unitNumber : userId?.unitId?.unitNumber,
        unitId : userId?._id,
        documentType : payload.documentType,
        description : payload.description ,
        image : payload.image ,
        tenantName : userId?.userId.name,
        propertyName : userId?.propertyId.propertyName,
        propertyId : userId?.propertyId._id,
        ownerId : userId?.unitId.ownerId
    }
    const result = await Document.create(documentData);
    return result
}


const getSingleOwnerAllDocumentsFromDB = async (id : string )=>{
    const result = await Document.find({ownerId : id}).sort({createdAt : -1})
    return result
}


const getSingleDocumentFromDB = async (id : string )=>{
    const result = await Document.findById({_id : id});
    return result
}


const getSingleUserAllDocumentsFromDB = async (id : string )=>{     
    const result = await Document.find({userId : id}).sort({createdAt : -1})
    return result
}

const findSingleTenentDocumentByOwnerFromDB = async (tenantId : string)=>{    
    const result = await Document.find({ tenantId}).sort({createdAt : -1})
    return result
}




export const DocumentService = {
    createDocumentIntoDB,
    getSingleOwnerAllDocumentsFromDB,
    getSingleDocumentFromDB,
    getSingleUserAllDocumentsFromDB,
    findSingleTenentDocumentByOwnerFromDB
}