import { Schema } from "mongoose";

export type TDocument = {
    tenantId: Schema.Types.ObjectId; 
    userId: Schema.Types.ObjectId; 
    documentType: string; 
    description: string; 
    image: string; 
    tenantName: string; 
    propertyName: string; 
    unitNumber: string; 
    unitId: Schema.Types.ObjectId; 
    propertyId: Schema.Types.ObjectId;
    ownerId: Schema.Types.ObjectId;
    status: "Pending" | "Approved" | "Reject";
};
