import { Schema, model } from 'mongoose';
import { TGlobalPriceRule } from './globalPriceRule.interface';

const globalPriceRuleSchema = new Schema<TGlobalPriceRule>(
  {
    pricePerRmb: { type: Number, required: true },
    pointsPerBdt: { type: Number, required: true },
    conversionRate: { type: Number, required: true },
    isOfferPrice: { type: Boolean, default: false },
    offerPriceId: { 
      type: Schema.Types.ObjectId, 
      ref: 'GlobalOfferPricing',  // Reference to the related model
      default: null 
    }, 
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const GlobalPriceRule = model<TGlobalPriceRule>('GlobalPriceRule', globalPriceRuleSchema);
