import { z } from 'zod';

// Create Offer Validation
const createOffer = z.object({
  body: z.object({
    offerPercent: z
      .number({ required_error: 'Offer percent is required' })
      .min(1, 'Offer percent must be at least 1')
      .max(100, 'Offer percent cannot exceed 100'),
    startDate: z.string({ required_error: 'Start date is required' }).datetime(),
    endDate: z.string({ required_error: 'End date is required' }).datetime(),
    title: z
      .string({ required_error: 'Title is required' })
      .min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    status: z.number().min(0).max(1).default(1), // 0 = inactive, 1 = active
  }),
});

// Update Offer Validation (all fields optional)
const updateOffer = z.object({
  body: z.object({
    offerPercent: z.number().min(1).max(100).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    status: z.number().min(0).max(1).optional(),
  }),
});

export const GlobalOfferPricingValidations = {
  createOffer,
  updateOffer,
};
