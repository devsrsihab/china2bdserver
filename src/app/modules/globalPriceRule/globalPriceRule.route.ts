import express from 'express';
import { GlobalPriceRuleController } from './globalPriceRule.controller';
import validateRequest from '../../middlewares/validateRequest';
import { GlobalPriceRuleValidations } from './globalPriceRule.validation';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

// Get all pricing rules
router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.manager),
  GlobalPriceRuleController.getAllRules,
);

// Get rule by ID
router.get(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.manager),
  GlobalPriceRuleController.getRuleById,
);

// Create rule (only admin, and only if none exists)
router.post(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  validateRequest(GlobalPriceRuleValidations.createGlobalPriceRule),
  GlobalPriceRuleController.createRule,
);

// Update rule
router.put(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  validateRequest(GlobalPriceRuleValidations.updateGlobalPriceRule),
  GlobalPriceRuleController.updateRule,
);

// Soft delete (forbidden)
router.delete('/:id', auth(USER_ROLE.admin, USER_ROLE.superAdmin), GlobalPriceRuleController.softDeleteRule);

export const GlobalPriceRuleRoute = router;
