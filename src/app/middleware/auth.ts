import httpStatus from 'http-status';
import { AppError } from '../errors/AppErrors';
import { catchAsync } from '../utils/catchAsync';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import { User } from '../Modules/User/user.model';
import { TUserRole } from '../Modules/User/user.interface';

export const Auth = (...requiredRole : TUserRole[]) => {
  return catchAsync(async (req, res, next) => {
    const token = req?.headers?.authorization;    
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorize!!');
    }
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        config.jwt_access_secret as string,
      ) as JwtPayload;
    } catch (err) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized!');
    }
    
    const { email, role } = decoded;
    const userData = await User.findOne({email});

    if (!userData) {
      throw new AppError(httpStatus.NOT_FOUND, 'User is not found, not decoded ');
    }

    if (requiredRole && !requiredRole.includes(role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorize!!!');
    }
    req.user = decoded as JwtPayload;
    next();
  });
};
