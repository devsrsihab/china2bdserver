import { z } from 'zod';

// Define Zod schemas for subobjects
const UserNameValidationSchema = z.object({
  firstName: z.string().min(1),
  middleName: z.string(),
  lastName: z.string().min(1),
});

// create validation
const createAdminValidationSchema = z.object({
  body: z.object({
    admin: z.object({
      name: UserNameValidationSchema,
      designation: z.string().min(1),
      gender: z.enum(['male', 'female', 'other']),
      dateOfBirth: z.string().optional(),
      email: z.string().email(),
      contactNo: z.string().min(1),
      emergencyContact: z.string().min(1),
      presentAddress: z.string().min(1),
      permanentAddress: z.string().min(1),
      profileImg: z.string().optional(),
    }),
  }),
});
// create validation
const updateAdminValidationSchema = z.object({
  body: z.object({
    admin: z.object({
      name: UserNameValidationSchema.optional(),
      designation: z.string().min(1).optional(),
      gender: z.enum(['male', 'female', 'other']).optional(),
      dateOfBirth: z.string().optional(),
      email: z.string().email().optional(),
      contactNo: z.string().min(1).optional(),
      emergencyContact: z.string().min(1).optional(),
      presentAddress: z.string().min(1).optional(),
      permanentAddress: z.string().min(1).optional(),
      profileImg: z.string().optional(),
    }),
  }),
});

export const AdminValidations = {
  createAdminValidationSchema,
  updateAdminValidationSchema,
};
