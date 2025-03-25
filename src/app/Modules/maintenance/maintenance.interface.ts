import { Schema } from "mongoose";

export type TMaintenance = {
    description: string;
    image: string;
    issueType: string;
    propertyName: string;
    unitNo: string;
    ownerId: Schema.Types.ObjectId ;
    propertyId: Schema.Types.ObjectId ;
    userId: Schema.Types.ObjectId ;
    status : "Pending" | "Completed" | "In Progress";
    isEmergency : boolean | string
}