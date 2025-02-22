import express from 'express';
import { userController } from './user.controller';
import { Auth } from '../../middleware/auth';
import { User_Role } from './user.constent';
import { upload } from '../../middleware/upload';

const router = express.Router();

router.get(
  '/allUsers',
  Auth(User_Role.admin, User_Role.owner, User_Role.tenant),
  userController.getAllUser,
);

router.get(
  '/',
  // Auth(),
  userController.getSingleUser,
);

router.post(
  '/resetPassword',
  userController.resetPassword,
);

router.patch(
  '/verifyOtpForResetPassword',
  userController.verifyOtpForResetPassword,
);

router.post(
  '/create-user',
  userController.createUser,
);

router.patch(
  '/',
  upload.array('profileImage', 1), 
  userController.updateUserData,
);

router.post(
  '/login',
  userController.loginUser,
);

router.patch(
  '/userDelete',
  userController.userDelete,
);

router.post(
  '/verifyOTP',
  userController.verifyOTP,
);

router.post(
  '/refresh-token',
  userController.refreshToken,
);

router.post(
  '/sendEmail',
  userController.sendEmailToUser,
);

router.post(
  '/contactUs',
  userController.ContactUsController,
);

router.get(
  '/getAdvisersData',
  userController.getAdvisersData,
);



export const UserRouter = router;
