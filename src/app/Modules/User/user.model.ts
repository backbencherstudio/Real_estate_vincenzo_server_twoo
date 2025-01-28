import { model, Schema } from "mongoose";
import bcrypt from 'bcrypt';
import { TUser } from "./user.interface";

// const presentAddressSchema = new Schema

// const userSchema = new Schema<TUser>(
//   {
//     name: {
//       type: String,
//       required: [true, "Name is required"],
//     },
//     email: {
//       type: String,
//       required: [true, "Email is required"],
//     },
//     password: {
//       type: String,
//       required: [true, "Password is required"],  
//     },
//     role: {
//       type: String,
//       enum: ["admin", "owner", "tenant"],  
//       required: [true, "Role is required"],
//     },
//     isDeleted: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );



const userSchema = new Schema<TUser>(
  {
    name: {
      type: String,
      // required: [true, "Name is required"],
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
  },
  {
    timestamps: true,
  }
);



userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashPassword,
) {
  return await bcrypt.compare(plainTextPassword, hashPassword);
};

export const User = model<TUser>('User', userSchema);
