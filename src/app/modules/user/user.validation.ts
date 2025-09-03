import { z } from 'zod';
import { USER_STATUS } from './user.constant';

// studentSchema validation
const UserSchemaValidation = z.object({
  password: z
    .string({
      invalid_type_error: 'Password must be a string',
    })
    .max(20, 'Password should be 20 Character')
    .min(8, 'Password should be 8 Character')
    .optional(),
});

// change status validation
const changeStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum([...USER_STATUS] as [string, ...string[]]),
  }),
});

const createUser = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    phone: z.string().optional(),
    address: z.string().optional(),
    district: z.string().optional(),
    city: z.string().optional(),
    profileImage: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['super-admin', 'admin', 'user', 'supplier', 'manager'], {
      required_error: 'Role is required',
    }),
    status: z.enum(['active', 'blocked']).optional(),
  }),
});

const updateUser = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email('Invalid email format').optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    district: z.string().optional(),
    city: z.string().optional(),
    emergencyNumber: z.string().optional(),
    profileImage: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    role: z.enum(['super-admin', 'admin', 'user', 'supplier', 'manager']).optional(),
    status: z.enum(['active', 'blocked']).optional(),
  }),
});

export const UserValidations = {
  updateUser,
  createUser,
  UserSchemaValidation,
  changeStatusValidationSchema,
};
