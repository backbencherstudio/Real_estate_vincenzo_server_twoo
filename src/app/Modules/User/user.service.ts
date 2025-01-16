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
    name: userData.name ,
    role : userData.role,
    userId : userData._id
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

const updateUserDataIntoDB = async (id: string, payload: any) => {
  
  const result = await User.findByIdAndUpdate(
    id,
    {
      $set: filteredObject(payload), 
    },
    {
      new: true, 
      runValidators: true,
    }
  );
  return result;
};

const getAllUserFromDB = async (query : Record< string, unknown >) => {
  // const userQuery = new QueryBuilder(User.find({role : query.role}), query)
  const userQuery = new QueryBuilder(User.find(), query)
  .filter()
  const result = await userQuery.modelQuery;
  return result;
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