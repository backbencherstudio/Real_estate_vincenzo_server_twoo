/* eslint-disable no-undef */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { AppError } from "../../errors/AppErrors";
import bcrypt from 'bcrypt'; 
import config from "../../config";
import {  User } from "./user.model";
import { TLoginUser, TUser } from "./user.interface";
import { sendEmail } from "../../utils/sendEmail";
import { createToken, verifyToken } from "./user.utils";
import { sendEmailToUser } from "../../utils/sendEmailToUser";
import { filteredObject } from "../../utils/updateDataUtils";
import QueryBuilder from "../../builder/QueryBuilder";
import path from "path";
import fs from "fs"


const createUserIntoDB = async (payload: TUser) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const isStudentExistsInUser = await User.findOne({ email: payload?.email });  
  if (isStudentExistsInUser ) {
    throw new AppError(400, 'User already exists');
  }
  await sendEmail(payload?.email, otp); 
  return {
    success: true,
    message: 'OTP sent to your email. Please verify to complete registration.',
    otp,
    name : payload.name,
    email : payload.email,
    password: payload.password ,
    isDeleted : payload.isDeleted,
    role : payload.role
  };
  
};


const verifyOTPintoDB = async (otp : string, sessionOtpData : {otp : string, password : string, createdAt : number} ) => {
  const { otp : sessionOTP, password, createdAt,  ...verifyData} = sessionOtpData;
  const hashedPassword =  await bcrypt.hash(password, 8 );

  const isMatched = parseInt(otp) === parseInt(sessionOTP)
  if(!isMatched){
    throw new AppError(httpStatus.NOT_EXTENDED, "Otp not matche try again")
  }
  const updateData = {
    ...verifyData,
    password :  hashedPassword
  }  
  const result = await User.create(updateData);
    return result
};

const loginUserIntoDB = async ( paylod: TLoginUser) => {
  
  const userData = await User.findOne({email : paylod.email});
  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, 'User is not found');
  }
    const res = await bcrypt.compare(paylod.password, userData.password)
  if(!res){
    throw new AppError(httpStatus.FORBIDDEN, 'password is not matched');
  }

  const jwtPayload = {
    email: userData.email,
    role : userData.role,
    userId : userData._id,
    customerId : userData?.customerId && userData?.customerId,
    subscriptionStatus : userData.subscriptionStatus
  };
  
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );
  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );
  return {
    accessToken,
    refreshToken,
  };
};

const getAbsoluteFilePath = (dbPath: string) => {
  try {
    const relativePath = dbPath
      .replace(/^\//, '')
      .replace(/^uploads\//, '');
    const uploadsDir = path.join(__dirname, '..', '..', '..','..', '/uploads');    
    return path.join(uploadsDir, relativePath);
  } catch (error) {
    console.error('Error constructing file path:', error);
    return null;
  }
};

const deleteFile = (filePath: string) => {
  try {
    if (!filePath) {
      console.error('Error: File path is undefined or null.');
      return false;
    }
    const normalizedPath = path.normalize(filePath);
    if (fs.existsSync(normalizedPath)) {
      fs.unlinkSync(normalizedPath);
      return true;
    } else {
      console.warn(`File not found: ${normalizedPath}`);
      return false;
    }
  } catch (error) {
    console.error(`Error deleting file: ${error}`);
    return false;
  }
};

const updateUserDataIntoDB = async (payload: Partial<TUser>) => {
  try {
    const userData = await User.findById(payload.userId).select("profileImage");

    if (userData?.profileImage) {
      const absoluteFilePath = getAbsoluteFilePath(userData.profileImage);
      if (absoluteFilePath) {
        deleteFile(absoluteFilePath);
      }
    }
    const updatedPayload = filteredObject(payload);

    const result = await User.findByIdAndUpdate(
      payload.userId,
      { $set: updatedPayload },
      { new: true, runValidators: true }
    );

    return result;
  } catch (error) {
    console.error(`Error updating user data:`, error);
    throw new Error('Failed to update user data');
  }
};

const getAllUserFromDB = async (query: Record<string, unknown>) => {
  if (query.subscriptionStatus === "nonSubscriber") {
    return await User.find({
      role: query.role,
      subscriptionStatus: { $exists: false } 
    });
  }
  const userQuery = new QueryBuilder(User.find(), query)
    .search(["name", "email"])
    .filter();

  return await userQuery.modelQuery; 
};

const getSingleUserFromDB = async (email : string) =>{  
 const result = await User.findOne({email})
 return result
}

const resetPasswordIntoDB = async (payload : any )=>{  
  const isUserExistsInUser = await User.findOne({ email: payload?.email });
  if(!isUserExistsInUser){
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await sendEmail(payload?.email, otp);
  const result = {
    otp,
    email : payload.email,
    password : payload.password
  }
  return result
}

const updatePasswordWithOtpVerification = async (getOtpData : any, resetOtpData : any ) =>{

  if( parseInt(getOtpData?.otp) !== parseInt(resetOtpData.otp)){
    throw new AppError(httpStatus.NOT_ACCEPTABLE, "OTP not match")
  }
  const hashedPassword = await bcrypt.hash(resetOtpData?.password, 8);
  const result = await User.findOneAndUpdate({email : resetOtpData.email}, {password : hashedPassword}, {new : true, runValidators : true})
  return result
}

const userDeleteIntoDB = async ( payload : any ) =>{  
    const isUserExists = await User.findOne({email : payload});
    if(!isUserExists){
      throw new AppError(httpStatus.BAD_REQUEST, "User not Found")
    }
    const result = await User.findOneAndUpdate({email : payload}, { isDeleted : true }, {new : true, runValidators : true})
    return result    
}

const refreshToken = async (token: string) => {  
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorize!');
  }
  const decoded = verifyToken(token, config.jwt_refresh_secret as string);
  const { email } = decoded;

  const userData = await User.findOne({email});

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, 'User is not found');
  }

  const jwtPayload = {
    email: userData.email,
    name: userData.name ,
    role : userData.role,
    userId : userData._id
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return {
    accessToken,
  };
};


const sendEmailToAllUser = async (payload : any) =>{
  const { email, subject, value, filePath } = payload;
  const result = await sendEmailToUser(email, subject, value, filePath)
  return result;
}


  export const UserServices = {
    getAllUserFromDB,
    getSingleUserFromDB,
    updateUserDataIntoDB,
    createUserIntoDB,
    userDeleteIntoDB,
    verifyOTPintoDB,
    updatePasswordWithOtpVerification,
    loginUserIntoDB,
    resetPasswordIntoDB,
    refreshToken,
    sendEmailToAllUser
  };