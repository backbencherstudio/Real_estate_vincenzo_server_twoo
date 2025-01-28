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
  personalInfo : TPersonalInfo;
  permanentAddress : TPermanentAddress;
  profileImage:string;
  name: string;
  email: string;
  role : "admin" | "owner" | "tenant"
  password: string;
  isDeleted: boolean;
  numberOfProperty : number;
  numberOfTotalUnits : number;
  totalAmount : number;
  totalRentAmount : number;
  bookedUnitNumber : number;
  customerId : string;
  subscriptionStatus:string;
  invoice_pdf : string;
  getTotalUnit : number
}


// ======================================>>>>>>>> Login Interface
export type TLoginUser = {
  email: string;
  password: string;
};


export interface UserModel extends Model<TUser> {
  isUserExistsByCustomeId(id: string): Promise<TUser>;
  isPasswordMatched(
    plainTextPassword: string,
    hashPassword: string,
  ): Promise<boolean>;
}

export type TUserRole = keyof typeof User_Role;