import { z } from 'zod';

// login validation
const loginValidatonSchema = z.object({
  body: z.object({
    id: z.string({ required_error: 'id is required', invalid_type_error: 'id must be string' }),
    password: z.string({
      required_error: 'password is required',
      invalid_type_error: 'password must be string',
    }),
  }),
});

// password change
const changePasswordValidatonSchema = z.object({
  body: z.object({
    oldPassword: z.string({
      required_error: 'old Password is required',
      invalid_type_error: 'old Password must be string',
    }),
    newPassword: z.string({
      required_error: 'password is required',
      invalid_type_error: 'password must be string',
    }),
  }),
});

// refresh token
const refreshTokenValidatonSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: 'refreshToken is required',
      invalid_type_error: 'refreshToken must be string',
    }),
  }),
});

// forget password
const forgetPasswordValidationSchema = z.object({
  body: z.object({
    id: z.string({
      required_error: 'User id is required',
    }),
  }),
});

// reset password
const resetPasswordValidationSchema = z.object({
  body: z.object({
    id: z.string({
      required_error: 'User id is required',
    }),
    newPassword: z.string({
      required_error: 'New Password id is required',
    }),
  }),
});

export const AuthValidation = {
  loginValidatonSchema,
  changePasswordValidatonSchema,
  refreshTokenValidatonSchema,
  forgetPasswordValidationSchema,
  resetPasswordValidationSchema,
};
