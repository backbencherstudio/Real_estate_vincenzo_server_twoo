import { model, Schema } from "mongoose";
import bcrypt from 'bcrypt';
import { TContactUs, TEmailCollection, TUser } from "./user.interface";


const userSchema = new Schema<TUser>(
  {
    name: {
      type: String,
    },
    stripeAccountId: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    routingNumber: {
      type: String,
      required: [true, "Routing Number is required"],
    },
    bankAccountNumber: {
      type: String,
      required: [true, "Bank Account Number is required"],
    },
    role: {
      type: String,
      enum: ["admin", "owner", "tenant"],
      default: "owner"
    },
    numberOfProperty: {
      type: Number,
    },
    numberOfTotalUnits: {
      type: Number,
    },
    totalAmount: {
      type: Number,
    },
    totalRentAmount: {
      type: Number,
    },
    bookedUnitNumber: {
      type: Number,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    personalInfo: {
      contactNumber: {
        type: String,
      },
      age: {
        type: Number,
      },
      familyMember: {
        type: Number,
      },
      jobTitle: {
        type: String,
      },
    },
    permanentAddress: {
      address: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      zipCode: {
        type: Number,
      },
      country: {
        type: String,
      },
    },
    customerId: {
      type: String,
    },
    subscriptionStatus: {
      type: String,
    },
    invoice_pdf: {
      type: String,
    },
    getTotalUnit: {
      type: Number,
    },
    isSecurityDepositPay: {
      type: Boolean
    },
    paidAmount: {
      type: Number
    },
    cancelRequest: {
      type: Boolean
    },
  },
  {
    timestamps: true,
  }
);

const ContactUsSchema = new Schema<TContactUs>(
  {
    fullName : String ,
    email : String,
    mobileNumber : String,
    message : String
  },
  {
    timestamps : true
  }
);

const emailCollectionSchema = new Schema<TEmailCollection>({
  email : {type : String,  required : true}
})

userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashPassword,
) {
  return await bcrypt.compare(plainTextPassword, hashPassword);
};

export const User = model<TUser>('User', userSchema);
export const ContactUs = model<TContactUs>('ContactUs', ContactUsSchema);
export const EmailCollection = model<TEmailCollection>('emailCollection', emailCollectionSchema);
