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
  OrderStatusController.getAllSkybuyTest,
);



export const SkybuyTestRoute = router;
