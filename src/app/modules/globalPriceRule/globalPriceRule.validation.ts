import { z } from 'zod';

const createGlobalPriceRule = z.object({
  body: z.object({
    pricePerRmb: z.number().positive('Price per RMB must be greater than 0'),
    pointsPerBdt: z.number().positive('Points per BDT must be greater than 0'),
    conversionRate: z.number().positive('Conversion rate must be greater than 0'),
    isOfferPrice: z.boolean(),
    offerPriceId: z.string().optional().nullable(),
  }),
});

const updateGlobalPriceRule = z.object({
  body: z.object({
    pricePerRmb: z.number().positive('Price per RMB must be greater than 0').optional(),
    pointsPerBdt: z.number().positive('Points per BDT must be greater than 0').optional(),
    conversionRate: z.number().positive('Conversion rate must be greater than 0').optional(),
    isOfferPrice: z.boolean().optional(),
    offerPriceId: z.string().optional().nullable(),
  }),
});

export const GlobalPriceRuleValidations = {
  createGlobalPriceRule,
  updateGlobalPriceRule,
};
