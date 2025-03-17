import { model, Schema } from "mongoose";
import { TPlanDetails, TRealEstateAdvisor, TTransactionData } from "./admin.interface";

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


const TransactionDataSchema: Schema = new Schema<TTransactionData>(
    {
        ownerId : {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Owner Id is required"]
        },
        name : {type : String},
        email : {type : String},
        transactionId : {type : String},
        amount : {type : Number},
        mainBalance : {type : Number},
        percentage : {type : Number},
        status : { type : String, enum : ['Send' , 'Received'], default : 'Send' }
    },
    {
        timestamps: true,
    }
)

export const PlanDetails = model<TPlanDetails>("planDetails", planDetailsSchema);
export const RealEstateAdvisor = model<TRealEstateAdvisor>("RealEstateAdvisor", RealEstateAdvisorSchema);
export const TransactionData = model<TTransactionData>("TransactionData", TransactionDataSchema);