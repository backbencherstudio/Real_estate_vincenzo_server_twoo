/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';
import { User_Role } from './user.constent';

// ======================================>>>>>>>> Register Interface

export type TPersonalInfo = {
  contactNumber ? : string;
  age ?: number;
  familyMember ?: number;
  jobTitle ?: string;
}

export type TPermanentAddress = {
  address ?: string;
  city ?: string;
  state ?: string;
  zipCode ?: number;
  country ?: string
}

export interface TUser {
  userId : string;
  stripeAccountId : string;
  personalInfo : TPersonalInfo;
  permanentAddress : TPermanentAddress;
  profileImage:string;
  name: string;
  email: string;
  bankAccountNumber: string;
  routingNumber: string;
  role : "admin" | "owner" | "tenant"
  password: string;
  isDeleted: boolean;
  numberOfProperty : number;
  numberOfTotalUnits : number;
  totalAmount : number;
  totalRentAmount : number;
  bookedUnitNumber : number;
  subscriptionStatus:string;
  invoice_pdf : string;
  getTotalUnit : number;
  isSecurityDepositPay?:boolean;
  paidAmount ?: number;
  cancelRequest : boolean;
  percentage:number;
  planName: string;
  customerId: string;
  bankAccountId: string
}


// ======================================>>>>>>>> Login Interface
export type TLoginUser = {
  email: string;
  password: string;
};

export type TContactUs = {
  fullName : string;
  email : string;
  mobileNumber : string;
  message : string
}


export interface UserModel extends Model<TUser> {
  isUserExistsByCustomeId(id: string): Promise<TUser>;
  isPasswordMatched(
    plainTextPassword: string,
    hashPassword: string,
  ): Promise<boolean>;
}

export type TUserRole = keyof typeof User_Role;

export type TEmailCollection = {
  email : string
}