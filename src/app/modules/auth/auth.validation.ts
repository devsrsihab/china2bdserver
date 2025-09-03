import { z } from 'zod';

const roleEnum = z.enum(['user', 'admin', 'supplier', 'manager']);
const statusEnum = z.enum(['active', 'inactive', 'banned']);

// register validation
const registerValidationSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),

    phone: z.string().optional(),
    address: z.string().optional(),
    district: z.string().optional(),
    city: z.string().optional(),
    emergencyNumber: z.string().optional(),
    profileImage: z.string().url('Must be a valid URL').optional(),

    role: roleEnum.default('user'),
    status: statusEnum.default('active'),
  }),
});

// login validation
const loginValidatonSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'email is required', invalid_type_error: 'email must be string' })
      .email('Invalid email'),
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
    email: z.string({
      required_error: 'User id is required',
    }),
  }),
});

// reset password
const resetPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string({
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
  registerValidationSchema,
};
