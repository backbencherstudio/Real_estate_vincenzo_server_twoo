import { model, Schema } from "mongoose";
import { TTenantPayment } from "./payment.interface";


const TenantPaymentSchema = new Schema<TTenantPayment>({
    userId: {
        type: Schema.Types.ObjectId,
        required: [true, 'User ID is required'],
        ref: 'User',
    },
    propertyId: {
        type: Schema.Types.ObjectId,
        required: [true, 'Property ID is required'],
        ref: 'Property',
    },
    unitId: {
        type: Schema.Types.ObjectId,
        required: [true, 'Unit ID is required'],
        ref: 'Unit',
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        required: [true, 'Owner ID is required'],
        ref: 'User',
    },
    status: {
        type: String,
        enum: ["Pending", "Paid"],
        default: "Pending",
    },
    invoice: {
        type: String,
        default : "Upcoming"
    },
    paidAmount: {
        type: Number
    },
    lateFee: {
        type: Number
    },
    PaymentPlaced:{
        type : Date
    },
    createdAt:{
        type : Date
    },
    updatedAt:{
        type : Date
    },
}, {
    timestamps: true,
    versionKey: false
});


export const TenantPayment = model('TenantPayment', TenantPaymentSchema);