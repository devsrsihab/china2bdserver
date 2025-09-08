import { GlobalPriceRule } from './globalPriceRule.model';
import { TGlobalPriceRule } from './globalPriceRule.interface';
import AppError from '../../errors/appError';
import httpStatus from 'http-status';
import { GlobalOfferPricing } from '../globalOfferPricing/globalOfferPricing.model';

// Get all pricing rules (only 1 record allowed)
const getAllRules = async () => {
  return await GlobalPriceRule.find({ isDeleted: false });
};

// Get rule by ID
const getRuleById = async (id: string) => {
  return await GlobalPriceRule.findOne({ _id: id, isDeleted: false });
};

// Create pricing rule (only if no rule exists)
const createRule = async (payload: TGlobalPriceRule) => {
  const existingRule = await GlobalPriceRule.findOne({ isDeleted: false });

  if (existingRule) {
    throw new AppError(
      httpStatus.CONFLICT,
      'A global pricing rule already exists. Only one rule is allowed.',
    );
  }

  // ✅ If offer price is true, validate offerPriceId
  if (payload.isOfferPrice) {
    if (!payload.offerPriceId) {
      throw new AppError(httpStatus.BAD_REQUEST, 'offerPriceId is required when isOfferPrice is true');
    }

    const offer = await GlobalOfferPricing.findById(payload.offerPriceId);
    if (!offer || offer.isDeleted) {
      throw new AppError(httpStatus.NOT_FOUND, 'Referenced offer not found');
    }
  }

  const newRule = new GlobalPriceRule(payload);
  return await newRule.save();
};

// Update rule by ID
const updateRule = async (id: string, payload: Partial<TGlobalPriceRule>) => {
  // ✅ If switching to offer price, validate offerPriceId
  if (payload.isOfferPrice) {
    if (!payload.offerPriceId) {
      throw new AppError(httpStatus.BAD_REQUEST, 'offerPriceId is required when isOfferPrice is true');
    }

    const offer = await GlobalOfferPricing.findById(payload.offerPriceId);
    if (!offer || offer.isDeleted) {
      throw new AppError(httpStatus.NOT_FOUND, 'Referenced offer not found');
    }
  }

  const rule = await GlobalPriceRule.findByIdAndUpdate(id, payload, {
    new: true,
  });

  if (!rule || rule.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Pricing rule not found');
  }

  return rule;
};

// ❌ Soft delete is not allowed (never delete global rule)
const softDeleteRule = async () => {
  throw new AppError(
    httpStatus.FORBIDDEN,
    'Global pricing rule cannot be deleted. Update instead.',
  );
};

export const GlobalPriceRuleServices = {
  getAllRules,
  getRuleById,
  createRule,
  updateRule,
  softDeleteRule,
};
