import { Schema } from "mongoose";

/* eslint-disable no-unused-vars */
export interface TGlobalPriceRule {
  pricePerRmb: number;        // Price per RMB
  pointsPerBdt: number;       // Points per BDT
  conversionRate: number;     // Conversion Rate
  isOfferPrice: boolean;      // Whether offer price applies
  offerPriceId?: Schema.Types.ObjectId;  // Reference to GlobalOfferPricing._id (if any)
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;        // For safety, but rule won't be deletable
  deletedAt?: Date | null;
}
