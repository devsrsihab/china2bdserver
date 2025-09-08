import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import { OrderStatusController } from './ordersStatus.controller';
import { OrderStatusValidations } from './ordersStatus.validation';

const router = express.Router();

// Get all order statuses
router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.manager),
  OrderStatusController.getAllOrderStatuses,
);

// Get order status by ID
router.get(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.manager, USER_ROLE.user),
  OrderStatusController.getOrderStatusById,
);

// Create order status
router.post(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  validateRequest(OrderStatusValidations.createOrderStatus),
  OrderStatusController.createOrderStatus,
);

// Update order status
router.put(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  validateRequest(OrderStatusValidations.updateOrderStatus),
  OrderStatusController.updateOrderStatus,
);

// Delete (soft) order status
router.delete(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  OrderStatusController.deleteOrderStatus,
);

export const OrderStatusRoute = router;
