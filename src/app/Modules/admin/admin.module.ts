import { model, Schema } from "mongoose";
import { TPlanDetails, TRealEstateAdvisor } from "./admin.interface";

const planDetailsSchema: Schema = new Schema<TPlanDetails>(
    {
        starter: {
            type: Number,
        },
        growth: {
            type: Number,
        },
        professional: {
            type: Number
        }
    },
    {
        timestamps: true,
    }
)

const RealEstateAdvisorSchema: Schema = new Schema<TRealEstateAdvisor>(
    {
        name : {type : String},
        designation : {type : String},
        image : {type : [String]},
        facebook : {type : String},
        twitter : {type : String},
        instagram : {type : String},
        linkedin : {type : String},
    },
    {
        timestamps: true,
    }
)

export const PlanDetails = model<TPlanDetails>("planDetails", planDetailsSchema);
export const RealEstateAdvisor = model<TRealEstateAdvisor>("RealEstateAdvisor", RealEstateAdvisorSchema);