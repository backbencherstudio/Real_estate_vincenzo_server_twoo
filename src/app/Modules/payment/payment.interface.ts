import { Schema } from "mongoose";


export type TTenantPayment = {
    userId : Schema.Types.ObjectId;
    propertyId : Schema.Types.ObjectId;
    unitId : Schema.Types.ObjectId;
    ownerId : Schema.Types.ObjectId;
    status : 'Pending' | "Paid";
    invoice : string;
  }
 