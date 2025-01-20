import { Schema, model } from "mongoose";
import { TCreateTenant, TProperties, TUnits } from "./owner.interface";

// Property Location Schema
const propertyLocationSchema = new Schema({
  country: {
    type: String,
    required: [true, "Country is required"],
  },
  state: {
    type: String,
    required: [true, "State is required"],
  },
  city: {
    type: String,
    required: [true, "City is required"],
  },
  address: {
    type: String,
    required: [true, "Address is required"],
  },
  zipCode: {
    type: Number,
    required: [true, "Zip code is required"],
  },
}, {versionKey: false});


const propertiesSchema = new Schema<TProperties>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner Id is required"],
    },
    propertyName: {
      type: String,
      required: [true, "Property name is required"],
    },
    Description: {
      type: String,
      required: [true, "Description is required"],
    },
    amenities: {
      type: String,
      required: false, 
    },
    availableParking: {
      type: Boolean,
      required: [true, "Parking is required"],
    },
    propertyLocation: {
      type: propertyLocationSchema,
      required: [true, "Property location details are required"],
    },
    propertyImages: {
      type: [String], 
      required: false, 
    },
    maintainerName: {
      type: String, 
      required: false,
    },
    houseNumber : {
      type : String,
      required : [true, "House Number is required"]
    },
    totalRent : {
      type : Number,
      default : 0
    },
    totalBookedRent : {
      type : Number,
      default : 0
    },
    numberOfUnits : {
      type : Number,
      default : 0
    },
    numberOfBookedUnits : {
      type : Number,
      default : 0
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const UnitSchema = new Schema<TUnits>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      required: [true, 'User ID is required'],
      ref: 'User',
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, "Property ID is required"],
    },
    unitNumber: {
      type: String,
      required: [true, "Unit number is required"],
    },
    numberOfBedroom: {
      type: Number,
      required: [true, "Number of bedrooms is required"],
    },
    numberOfBathroom: {
      type: Number,
      required: [true, "Number of bathrooms is required"],
    },
    numberOfKitchen: {
      type: Number,
      required: [true, "Number of kitchens is required"],
    },
    rent: {
      type: Number,
      required: [true, "Rent amount is required"],
    },
    booked: {
      type: Boolean,
      default: false,
    },
    securityDeposit: {
      type: Number,
      required: [true, "Security deposit is required"],
    },
    isSecurityDepositPay: {
      type: Boolean,
      default: false,
    },
    rentType: {
      type: String,
      required: [true, "Rent type is required"],
    },
    lateFee: {
      type: Number,
      required: [true, "Late fee is required"],
    },
    paymentDueDate: {
      type: Date,
      required: [true, "Payment due date is required"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);



const createTenantSchema = new Schema<TCreateTenant>({
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
}, {
  timestamps: true,
  versionKey : false
});


export const Tenant = model('Tenant', createTenantSchema);
export const Properties = model<TProperties>('Property', propertiesSchema);
export const Unit = model<TUnits>('Unit', UnitSchema);
