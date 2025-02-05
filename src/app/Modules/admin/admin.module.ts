import { model, Schema } from "mongoose";
import { TPlanDetails } from "./admin.interface";

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



export const PlanDetails = model<TPlanDetails>("planDetails", planDetailsSchema);