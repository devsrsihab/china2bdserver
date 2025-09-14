import { z } from 'zod';

// Create validation
const createOrderStatus = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    sortOrder: z.number().optional(),
  }),
});

// Update validation
const updateOrderStatus = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    sortOrder: z.number().optional(),
  }),
});

export const OrderStatusValidations = {
  createOrderStatus,
  updateOrderStatus,
};
