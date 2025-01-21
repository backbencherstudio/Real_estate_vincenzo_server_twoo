import { model, Schema } from "mongoose";
import { TDocument } from "./document.interface";


const DocumentSchema: Schema = new Schema<TDocument>(
    {
      tenantId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Tenant", 
      },
      userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User", 
      },
      documentType: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      tenantName: {
        type: String,
        required: true,
      },
      propertyName: {
        type: String,
        required: true,
      },
      unitNumber: {
        type: String,
        required: true,
      },
      unitId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Unit",
      },
      propertyId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Property", 
      },
      ownerId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User", 
      },
      status: {
        type: String,
        enum: ["Pending", "Approved", "Reject"], 
        default: "Pending", 
      },
    },
    {
      timestamps: true, 
    }
  )

  export type TPopulatedTenant = {
    unitId: {
      unitNumber: string;
      ownerId: Schema.Types.ObjectId;
    };
    userId: {
      name: string;
    };
    propertyId: {
      propertyName: string;
      _id: Schema.Types.ObjectId;
    };
    _id: Schema.Types.ObjectId; 
  };
  
  export const Document =  model<TDocument>("Document", DocumentSchema);