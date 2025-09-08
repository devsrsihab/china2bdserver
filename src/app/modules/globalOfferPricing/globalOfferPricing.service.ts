/* eslint-disable @typescript-eslint/no-explicit-any */
import { TGlobalOfferPricing } from './globalOfferPricing.interface';
import { GlobalOfferPricing } from './globalOfferPricing.model';
import AppError from '../../errors/appError';
import httpStatus from 'http-status';



// 🔹 Get all offers
const getAllOffers = async (role: string) => {
  const now = new Date();

  const filter: Record<string, unknown> = { isDeleted: false };

  if (role === 'user') {
    // Users see only currently valid active offers
    filter.status = 1;
    filter.startDate = { $lte: now };
    filter.endDate = { $gte: now };
  }
  // Admins & Managers → see everything (status 0 or 1, expired or active)

  return await GlobalOfferPricing.find(filter);
};


// 🔹 Get offer by ID
const getOfferById = async (id: string, role: string) => {
  const now = new Date();

  const filter: Record<string, unknown> = { _id: id, isDeleted: false };

  if (role === 'user') {
    // Only active and not expired
    filter.status = 1;
    filter.startDate = { $lte: now };
    filter.endDate = { $gte: now };
  }

  return await GlobalOfferPricing.findOne(filter);
};


// Create offer
const createOffer = async (payload: TGlobalOfferPricing) => {
  // If the new offer is going to be active
  if (payload.status === 1) {
    const activeOffer = await GlobalOfferPricing.findOne({
      status: 1,
      isDeleted: false,
    });

    if (activeOffer) {
      throw new AppError(
        httpStatus.CONFLICT,
        'An active offer already exists. Please deactivate it before creating a new one.',
      );
    }
  }

  const newOffer = new GlobalOfferPricing(payload);
  return await newOffer.save();
};

// Update offer
const updateOffer = async (id: string, payload: Partial<TGlobalOfferPricing>) => {
  const updated = await GlobalOfferPricing.findByIdAndUpdate(id, payload, { new: true });
  if (!updated) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offer not found');
  }
  return updated;
};

// Soft delete offer
const softDeleteOffer = async (id: string) => {
  const deleted = await GlobalOfferPricing.findByIdAndUpdate(
    id,
    { isDeleted: true, deletedAt: new Date() },
    { new: true },
  );
  if (!deleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offer not found');
  }
  return deleted;
};

export const GlobalOfferPricingServices = {
  getAllOffers,
  getOfferById,
  createOffer,
  updateOffer,
  softDeleteOffer,
};
