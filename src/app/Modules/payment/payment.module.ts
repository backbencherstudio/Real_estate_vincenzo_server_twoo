import { model, Schema, Types } from "mongoose";
import { TOwnerPayOut, TTenantPayment } from "./payment.interface";


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
        enum: ["Pending", "Paid", "Cash Pay"],
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
    lastDueDate:{
        type : Date
    },
}, {
    timestamps: true,
    versionKey: false
});


const OwnerPayoutSchema = new Schema <TOwnerPayOut>({
    ownerId: { type: Types.ObjectId, required: true, ref: 'User' }, 
    amount: { type: Number, required: true },
    accountId: { type: String, required: true },
    email: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending', 'On progress', 'Failed', 'Paid', 'Paiddd', 'Accepted', 'Rejected'], 
      default: 'Pending',
    },
    transactionId: { type: String }, 
    payoutId: { type: String }, 
    Receipt: { type: String }, 
  }, { timestamps: true })

export const OwnerPayout = model('OwnerPayout', OwnerPayoutSchema);

export const TenantPayment = model('TenantPayment', TenantPaymentSchema);