import { JwtPayload } from 'jsonwebtoken';
import httpStatus from 'http-status';
import AppError from '../../errors/appError';
import { User } from '../user/user.model';
import { TLoginUser } from './auth.interface';
import config from '../../config';
import bcrypt from 'bcrypt';
import { createToken } from './auth.utils';
import jwt from 'jsonwebtoken';
import { sendMail } from '../../utils/sendEmail';

// create
const loginUser = async (payload: TLoginUser) => {
  const user = await User.isUserExistByCustomId(payload.id);
  const isDeleted = user?.isDeleted;
  const isUserBlocked = user?.status === 'blocked';

  // user exist
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User is Not Found');
  }

  // check deleted
  if (isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User is deleted');
  }

  // check block
  if (isUserBlocked) {
    throw new AppError(httpStatus.NOT_FOUND, 'User is blocked');
  }

  // checking password
  const isPasswordMatch = await User.isPasswordMatch(payload.password, user.password);

  if (!isPasswordMatch) {
    throw new AppError(httpStatus.FORBIDDEN, 'Incorrect password');
  }

  // jwt token
  const jwtPayload = {
    userId: user?.id,
    role: user?.role,
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
    neetPassWord: user.needPasswordChange,
  };
};

// change password
const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string },
) => {
  const user = await User.isUserExistByCustomId(userData.userId);
  const isDeleted = user?.isDeleted;
  const isUserBlocked = user?.status === 'blocked';

  // user exist
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User is Not Found');
  }

  // check deleted
  if (isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User is deleted');
  }

  // check block
  if (isUserBlocked) {
    throw new AppError(httpStatus.NOT_FOUND, 'User is blocked');
  }

  // checking password
  const isPasswordMatch = await User.isPasswordMatch(payload.oldPassword, user?.password);

  if (!isPasswordMatch) {
    throw new AppError(httpStatus.FORBIDDEN, 'Incorrect Old password');
  }

  // hashed password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const result = User.findOneAndUpdate(
    { id: userData.userId, role: userData.role },
    {
      password: newHashedPassword,
      needPasswordChange: false,
      passwordChangedAt: new Date(),
    },
  );

  return result;
};

// refresh token
const refreshToken = async (token: string) => {
  // Check if the token exists
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
  }

  // Verify the token
  console.log('hello');
  const decoded = jwt.verify(token, config.jwt_refresh_secret as string) as JwtPayload;


  // user role checking
  const { userId, iat } = decoded as JwtPayload;
  const user = await User.isUserExistByCustomId(userId);
  const isDeleted = user?.isDeleted;
  const isUserBlocked = user?.status === 'blocked';

  // user exist
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User is Not Found');
  }

  // check deleted
  if (isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User is deleted');
  }

  // check block
  if (isUserBlocked) {
    throw new AppError(httpStatus.NOT_FOUND, 'User is blocked');
  }

  // check the user issed password or jwt issued  time
  if (
    user.passwordChangedAt &&
    (await User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat as number))
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
  }

  // jwt token
  const jwtPayload = {
    userId: user?.id,
    role: user?.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return {
    accessToken,
  }
};

// forget password
const forgetPassword = async (id: string) => {

    // user  existence checking
    const user = await User.isUserExistByCustomId(id);
    const isDeleted = user?.isDeleted;
    const isUserBlocked = user?.status === 'blocked';

    // user exist
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User is Not Found');
    }

    // check deleted
    if (isDeleted) {
      throw new AppError(httpStatus.NOT_FOUND, 'User is deleted');
    }

    // check block
    if (isUserBlocked) {
      throw new AppError(httpStatus.NOT_FOUND, 'User is blocked');
    }

    // jwt token
    const jwtPayload = {
      userId: user?.id,
      role: user?.role,
    };

    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as string,
      '10m'
    );


    // reset ui link 
    const resetUILink = `${config.reset_password_ui_link}/?id=${user.id}&token=${accessToken}`;

    sendMail(user.email, resetUILink);

};

// reset password
const resetPassword = async (payload: { id: string; newPassword: string }, token: string) => {
  // check user existence
  const user = await User.isUserExistByCustomId(payload.id);
  const isDeleted = user?.isDeleted;
  const isUserBlocked = user?.status === 'blocked';

  // user exist
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User is Not Found');
  }

  // check deleted
  if (isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User is deleted');
  }

  // check block
  if (isUserBlocked) {
    throw new AppError(httpStatus.NOT_FOUND, 'User is blocked');
  }

  // Verify the token
  const decoded = jwt.verify(token, config.jwt_access_secret as string) as JwtPayload;

  // check if user id and token id match
  if (user.id !== decoded.userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are Forbidden');
  }

  // hashed password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const result = User.findOneAndUpdate(
    { id: decoded.userId, role: decoded.role },
    {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
    },
  );

  return result
};

export const AuthServices = {
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword
};
