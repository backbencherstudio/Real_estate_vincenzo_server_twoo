/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { UserServices } from './user.service';
import config from '../../config';
import { AppError } from '../../errors/AppErrors';

declare module 'express-session' {
  interface SessionData {
    otpData?: {
      otp: string;
      createdAt : number;
      name : string;
      email : string;
      bankAccountNumber : string;
      routingNumber : string;
      password : string;
      isDeleted : boolean;
      role : string
    };
  }
}

declare module 'express-session' {
  interface SessionData {
    resetOTP?: {
      otp: string;
      email : string;
      password : string;
      // bankAccountNumber: string;
      // routingNumber: string;
    };
  }
}


const createUser = catchAsync(async (req, res) => {
  const result = await UserServices.createUserIntoDB(req.body);
  req.session.otpData = {
    otp: result.otp,
    name : result.name,
    email : result.email,
    password: result.password,
    bankAccountNumber: result.bankAccountNumber,
    routingNumber: result.routingNumber,
    isDeleted : result.isDeleted,
    role:result.role,
    createdAt: Date.now(),  
  };
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP sent, please check your email.',
    data: result,  
  });
});

const verifyOTP = catchAsync(async (req, res) => {
  const { otp } = req.body;  
  const sessionOtpData = req.session.otpData;

  if (!sessionOtpData) {
    throw new AppError(400, 'OTP expired or not set.');
  }
  const currentTime = Date.now();
  const elapsedTime = (currentTime - sessionOtpData.createdAt) / 1000;

  if (elapsedTime > 120) { 
    req.session.destroy(() => {}); 
    throw new AppError(400, 'OTP has expired. Please request a new OTP.');
  }
  const result = await UserServices.verifyOTPintoDB(otp, sessionOtpData);
  req.session.destroy(() => {}); 
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User registered successfully!',
    data: result,
  });
});

const loginUser = catchAsync(async (req, res) => {  
  const result = await UserServices.loginUserIntoDB(req.body);

  const { refreshToken, accessToken } = result;
  res.cookie('refreshToken', refreshToken, {
    secure: config.NODE_ENV === 'development',
    httpOnly: true,
    sameSite : 'none',    
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is loged in successfully',
    data: {
      accessToken,
    },
  });
});

const updateUserData = catchAsync(async (req, res) => {  

  const files = req.files as Express.Multer.File[];
  const profileImage = files?.map((file) => `/uploads/${file.filename}`);

  const profileData = {
    ...req.body,
    profileImage : profileImage[0]
  };
  
  const result = await UserServices.updateUserDataIntoDB(profileData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User Data update successfully',
    data: result,
  });
});


const getAllUser = catchAsync(async (req, res) => {
  const result = await UserServices.getAllUserFromDB(req?.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'get all users',
    data: result,
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const result = await UserServices.getSingleUserFromDB(req?.query?.email as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'get single user',
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const result = await UserServices.resetPasswordIntoDB(req?.body); 
  req.session.resetOTP = {
    otp: result.otp,
    email : result.email,
    password: result.password ,
  }
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP send Your Email, reset password withen 2 minuts',
    data: null,
  });
});

const verifyOtpForResetPassword = catchAsync(async (req, res)=>{
  const getOtpData = req.body;  
  const resetOtpData = req.session.resetOTP;
  if(!resetOtpData){
    throw new Error("OTP was expaired try again")
  }
  const result = await UserServices.updatePasswordWithOtpVerification(getOtpData, resetOtpData);
  req.session.destroy(() => {}); 
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'reset password successfully!',
    data: result,
  });

} )

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await UserServices.refreshToken(refreshToken);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access is token retrived successfully',
    data: result,
  });
});


const userDelete = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await UserServices.userDeleteIntoDB(email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User Delete successFully',
    data: result,
  });
});


const sendEmailToUser = catchAsync(async (req, res) => {
  const result = await UserServices.sendEmailToAllUser(req.body); 
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Email send  successfully',
    data: result,
  });
});



const ContactUsController = catchAsync(async (req, res) => {
  const result = await UserServices.ContactUsService(req.body); 
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Email send  successfully',
    data: result,
  });
});

const getAllContactUsMessage = catchAsync(async (req, res) => {
  const result = await UserServices.getAllContactUsMessageFromDB(); 
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Get All contact us message successfully',
    data: result,
  });
});

const deleteContactUsData = catchAsync(async (req, res) => {
  const result = await UserServices.deleteContactUsDataFromDB(req.params.id); 
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Delete contact us data successfully',
    data: result,
  });
});



const getAdvisersData = catchAsync(async (req, res) => {
  const result = await UserServices.getAdvisersDataFromDB(); 
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'get Adviser data successfully',
    data: result,
  });
});

const emailCollection = catchAsync(async (req, res) => {
  const result = await UserServices.emailCollectionIntoDB(req.body); 
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Your email has been successfully sent',
    data: result,
  });
});


export const userController = {
  getAllUser,
  getSingleUser,
  createUser,
  loginUser,
  updateUserData,
  userDelete,
  verifyOTP,
  refreshToken,
  resetPassword,
  verifyOtpForResetPassword,
  sendEmailToUser,
  ContactUsController,
  getAllContactUsMessage,
  deleteContactUsData,
  getAdvisersData,
  emailCollection
};
