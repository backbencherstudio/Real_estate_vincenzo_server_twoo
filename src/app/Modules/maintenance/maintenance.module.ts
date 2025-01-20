import { model, Schema } from "mongoose";
import { TMaintenance } from "./maintenance.interface";


const TMaintenanceSchema = new Schema<TMaintenance>(
    {
      description: { type: String, required: true },
      image: { type: String, required: true }, 
      issueType: { type: String, required: true },
      propertyName: { type: String, required: true },
      unitNo: { type: String, required: true },
      ownerId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
      propertyId: { type: Schema.Types.ObjectId, required: true, ref: "Property" },
      userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
      status : {
        type : String,
        enum : ["Pending", "Completed", "In Progress"],
        default : "Pending"
      }
    },
    { timestamps: true, versionKey : false } 
  );
  

  export const Maintenance = model<TMaintenance>("Maintenance", TMaintenanceSchema);