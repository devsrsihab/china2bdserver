import express from 'express';
import { GlobalOfferPricingController } from './globalOfferPricing.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { GlobalOfferPricingValidations } from './globalOfferPricing.validation';

const router = express.Router();

// Get all offers
router.get(
  '/',
  auth(USER_ROLE.admin,USER_ROLE.superAdmin, USER_ROLE.manager),
  GlobalOfferPricingController.getAllOffers,
);

// Get offer by ID
router.get(
  '/:id',
  auth(USER_ROLE.admin,USER_ROLE.superAdmin, USER_ROLE.manager, USER_ROLE.user),
  GlobalOfferPricingController.getOfferById,
);

// Create offer
router.post(
  '/',
  auth(USER_ROLE.admin,USER_ROLE.superAdmin, USER_ROLE.manager),
  validateRequest(GlobalOfferPricingValidations.createOffer),
  GlobalOfferPricingController.createOffer,
);

// Update offer
router.put(
  '/:id',
  auth(USER_ROLE.admin,USER_ROLE.superAdmin, USER_ROLE.manager),
    validateRequest(GlobalOfferPricingValidations.updateOffer),
  GlobalOfferPricingController.updateOffer,
);

// Soft delete offer
router.delete(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin,),
  GlobalOfferPricingController.deleteOffer,
);

export const GlobalOfferPricingRoute = router;
