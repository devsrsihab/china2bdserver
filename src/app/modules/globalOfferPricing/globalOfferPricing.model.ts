import { Schema, model } from 'mongoose';
import { TGlobalOfferPricing } from './globalOfferPricing.interface';

const globalOfferPricingSchema = new Schema<TGlobalOfferPricing>(
  {
    offerPercent: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: Number, enum: [0, 1], default: 1 }, // 1 = active, 0 = inactive
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const GlobalOfferPricing = model<TGlobalOfferPricing>(
  'GlobalOfferPricing',
  globalOfferPricingSchema,
);
