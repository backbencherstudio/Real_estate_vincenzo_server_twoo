import { Schema } from "mongoose";

export type TpropertyLocation = {
    country : string;
    state : string;
    city : string;
    address : string;
    zipCode : number;
}

export type TProperties = {
    ownerId : Schema.Types.ObjectId;
    propertyName: string;
    numberOfUnits : number;
    Description : string;
    amenities : string;
    availableParking : boolean;
    propertyLocation : TpropertyLocation;
    propertyImages ?: string[];
    maintainerName ?: string;
    houseNumber : string;
    totalRent : number;
    totalBookedRent : number;
    numberOfBookedUnits : number;
  }
  
export type TUnits = {
    ownerId : Schema.Types.ObjectId;
    propertyId : Schema.Types.ObjectId;
    unitNumber : string;
    numberOfBedroom : number;
    numberOfBathroom : number;
    numberOfKitchen : number;
    rent : number;
    booked : boolean;
    securityDeposit : number;
    isSecurityDepositPay : boolean;
    rentType : string;
    lateFee : number;
    paymentDueDate : Date;
  }
  

  export type TCreateTenant = {
    userId : Schema.Types.ObjectId;
    propertyId : Schema.Types.ObjectId;
    unitId : Schema.Types.ObjectId;
    ownerId : Schema.Types.ObjectId;
    // unitNumber : string;
    // name : string;
    // email : string;
    // role : string;
    // password: string;
    // isDeleted: boolean;
  }

  