import { Schema, model } from 'mongoose';
import { TOrderStatus } from './ordersStatus.interface';

const orderStatusSchema = new Schema<TOrderStatus>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const OrderStatus = model<TOrderStatus>('OrderStatus', orderStatusSchema);
