import { JwtPayload } from 'jsonwebtoken';
import httpStatus from 'http-status';
import AppError from '../../errors/appError';
import { User } from '../user/user.model';
import { TLoginUser, TRegisterUser } from './auth.interface';
import config from '../../config';
import bcrypt from 'bcrypt';
import { createToken, TJwtPayload } from './auth.utils';
import jwt from 'jsonwebtoken';
import { sendMail } from '../../utils/sendEmail';
import { Otp } from './auth.model';
import { TUser } from '../user/user.interface';
import { normalizePhone } from '../../utils/normalizePhone';

// register
const registerUser = async (payload: TRegisterUser) => {
  // ✅ Normalize phone before saving
  const normalizedPhone = normalizePhone(payload.phone);

  // ✅ Check if user exists by normalized phone
  const isExist = await User.findOne({ phone: normalizedPhone });

  if (isExist) {
    throw new AppError(
      httpStatus.CONFLICT,
      "User already exists with this phone number"
    );
  }

  const newUser = await User.create({
    ...payload,
    phone: normalizedPhone, // ✅ always store in normalized format
    role: payload.role || "user",
    status: payload.status || "active",
    isDeleted: false,
    emailVerified: false,
    phoneVerified: false,
  });

  // jwt token payload
  const jwtPayload = {
    email: newUser?.email,
    phone: newUser?.phone,
    role: newUser?.role,
  };

  // generate tokens
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );
  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    user: newUser,
  };
};

// login
const loginUser = async (payload: TLoginUser) => {
  const user = await User.isUserExistByEmail(payload.email);
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
    email: user?.email,
    phone: user?.phone,
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
  };
};

// change password
const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string },
) => {
  const user = await User.isUserExistByEmail(userData.email);
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
    { email: userData.email, role: userData.role },
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
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
  }

  const decoded = jwt.verify(token, config.jwt_refresh_secret as string) as JwtPayload;

  const { email, phone } = decoded as JwtPayload;

  // Look up user by email or phone
  const user = email
    ? await User.isUserExistByEmail(email)
    : await User.findOne({ phone });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'User is deleted');
  }

  if (user.status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'User is blocked');
  }

  const jwtPayload: TJwtPayload = {
    email: user.email,  // may be undefined
    phone: user.phone,  // may be undefined
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return { accessToken };
};


// forget password
const forgetPassword = async (email: string) => {
  // user  existence checking
  const user = await User.isUserExistByEmail(email);
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
    email: user?.email,
    phone: user?.phone,
    role: user?.role,
  };

  const accessToken = createToken(jwtPayload, config.jwt_access_secret as string, '10m');

  // reset ui link
  const resetUILink = `${config.reset_password_ui_link}/?id=${user.email}&token=${accessToken}`;

  sendMail(user?.email, resetUILink);
};

// reset password
const resetPassword = async (payload: { email: string; newPassword: string }, token: string) => {
  // check user existence
  const user = await User.isUserExistByEmail(payload.email);
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
  if (user.email !== decoded.email) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are Forbidden');
  }

  // hashed password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const result = User.findOneAndUpdate(
    { email: decoded.email, role: decoded.role },
    {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
    },
  );

  return result;
};



const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtp = async (identifier: { phone?: string; email?: string }) => {
  const otp = generateOtp(); // e.g., 6-digit random
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

  const otpData: any = { otp, expiresAt };
  if (identifier.phone) otpData.phone = identifier.phone;
  if (identifier.email) otpData.email = identifier.email;

  await Otp.create(otpData);

  // TODO: integrate SMS or Email provider
  if (identifier.phone) {
    console.log(`📱 OTP for ${identifier.phone}: ${otp}`);
  } else if (identifier.email) {
    console.log(`📧 OTP for ${identifier.email}: ${otp}`);
  }

  return { message: "OTP sent successfully" };
};


const verifyOtp = async (identifier: { phone?: string; email?: string }, otp: string) => {
  // Build query dynamically
  const query: any = { otp, used: false };
  if (identifier.phone) query.phone = identifier.phone;
  if (identifier.email) query.email = identifier.email;

  // Find OTP record
  const record = await Otp.findOne(query).sort({ createdAt: -1 });

  if (!record) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }

  if (record.expiresAt < new Date()) {
    throw new AppError(httpStatus.BAD_REQUEST, "OTP expired");
  }

  // Mark OTP as used
  record.used = true;
  await record.save();

  // Find or create user
  let user: TUser | null = null;

  if (identifier.phone) {
    user = await User.findOne({ phone: identifier.phone, isDeleted: false });
    if (!user) {
      user = await User.create({
        phone: identifier.phone,
        role: "user",
        password: "no-password",
      });
    }
  } else if (identifier.email) {
    user = await User.findOne({ email: identifier.email, isDeleted: false });
    if (!user) {
      user = await User.create({
        email: identifier.email,
        role: "user",
        password: "no-password",
      });
    }
  }

  if (!user) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "User creation failed");
  }

  // Build JWT payload safely
  const jwtPayload: Record<string, any> = {
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
  if (user.email) jwtPayload.email = user.email;
  if (user.phone) jwtPayload.phone = user.phone;

  // Generate JWT
  const token = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: config.jwt_access_expires_in,
  });

  return { token, user };
};





export const AuthServices = {
  registerUser,
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
  verifyOtp, 
  sendOtp
};
