import { GlobalOfferPricingServices } from './globalOfferPricing.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';

// Get all offers
const getAllOffers = catchAsync(async (req, res) => {
  const role = req.user?.role || 'user'; // fallback
  const offers = await GlobalOfferPricingServices.getAllOffers(role);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offers retrieved successfully',
    data: offers,
  });
});

// Get offer by ID
const getOfferById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const role = req.user?.role || 'user';
  const offer = await GlobalOfferPricingServices.getOfferById(id, role);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offer retrieved successfully',
    data: offer,
  });
});

// Create offer
const createOffer = catchAsync(async (req, res) => {
  const result = await GlobalOfferPricingServices.createOffer(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Offer created successfully',
    data: result,
  });
});

// Update offer
const updateOffer = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await GlobalOfferPricingServices.updateOffer(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offer updated successfully',
    data: result,
  });
});

// Soft delete offer
const deleteOffer = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await GlobalOfferPricingServices.softDeleteOffer(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offer deleted successfully',
    data: result,
  });
});

export const GlobalOfferPricingController = {
  getAllOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
};
