import { Router } from 'express';
import { UserRoute } from '../modules/user/user.route';
import { CourseRoute } from '../modules/course/course.route';
import { AdminRoute } from '../modules/admin/admin.route';
import { AuthRoute } from '../modules/auth/auth.route';
import { OrderStatusRoute } from '../modules/ordersStatus/ordersStatus.route';
import { GlobalOfferPricingRoute } from '../modules/globalOfferPricing/globalOfferPricing.route';
import { GlobalPriceRuleRoute } from '../modules/globalPriceRule/globalPriceRule.route';

const router = Router();

// all routes
const moduleRoutes = [
  {
    path: '/users',
    route: UserRoute,
  },
  {
    path: '/courses',
    route: CourseRoute,
  },
  {
    path: '/admins',
    route: AdminRoute,
  },
  {
    path: '/auth',
    route: AuthRoute,
  },
  {
    path: '/order-status',
    route: OrderStatusRoute,
  },
  {
    path: '/offers',
    route: GlobalOfferPricingRoute,
  },
  {
    path: '/pricing-rules',
    route: GlobalPriceRuleRoute,
  },
  
];

// travers the all route
moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
