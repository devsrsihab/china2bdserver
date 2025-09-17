/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthServices } from './auth.service';
import config from '../../config';

// change password
const registerUser = catchAsync(async (req, res) => {
  const registerData = req.body;
  const result = await AuthServices.registerUser(registerData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'register user successfully',
    data: result,
  });
});

// login
const loginUser = catchAsync(async (req, res) => {
  const result: any = await AuthServices.loginUser(req.body);
  const { refreshToken, accessToken, neetPassWord } = result;

  // save refresh token in cookie
  res.cookie('refreshToken', refreshToken, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: true,
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'login successfully',
    data: { accessToken, neetPassWord },
  });
});

// change password
const changePassword = catchAsync(async (req, res) => {
  const user = req?.user;
  const { ...passwordData } = req.body;
  const result = await AuthServices.changePassword(user, passwordData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password changed successfully',
    data: result,
  });
});

// refresh token
const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;

  const result = await AuthServices.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'access token retrive successfully',
    data: result,
  });
});

// forget password
const forgetPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await AuthServices.forgetPassword(email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password Reset Link generated successfully',
    data: result,
  });
});

// reset password
const resetPassword = catchAsync(async (req, res) => {
  const token = req.headers.authorization as string;
  const result = await AuthServices.resetPassword(req.body, token);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password Reset successfully',
    data: result,
  });
});


// 🔹 Send OTP (phone OR email)
const sendOtp = catchAsync(async (req, res) => {
  const { phone, email } = req.body;

  if (!phone && !email) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Phone or Email is required",
      data: null,
    });
  }

  const result = await AuthServices.sendOtp({ phone, email });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP sent successfully",
    data: result,
  });
});

// 🔹 Verify OTP (phone OR email + otp)
const verifyOtp = catchAsync(async (req, res) => {
  const { phone, email, otp } = req.body;

  if ((!phone && !email) || !otp) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Phone/Email and OTP are required",
      data: null,
    });
  }

  const result = await AuthServices.verifyOtp({ phone, email }, otp);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login successful",
    data: result,
  });
});

export const AuthControllers = {
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
  registerUser,
  verifyOtp,
  sendOtp
};
