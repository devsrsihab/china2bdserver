import { Router } from 'express';
import { UserRoute } from '../modules/user/user.route';
import { AdminRoute } from '../modules/admin/admin.route';
import { AuthRoute } from '../modules/auth/auth.route';
import { OrderStatusRoute } from '../modules/ordersStatus/ordersStatus.route';
import { GlobalOfferPricingRoute } from '../modules/globalOfferPricing/globalOfferPricing.route';
import { GlobalPriceRuleRoute } from '../modules/globalPriceRule/globalPriceRule.route';
import { ProductRoutes } from '../modules/product/product.route';
import { SkybuyTestRoute } from '../modules/skybuy/ordersStatus.route';

const router = Router();

// all routes
const moduleRoutes = [
  {
    path: '/users',
    route: UserRoute,
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
  {
    path: '/products',
    route: ProductRoutes,
  },
  {
    path: '/skybuy',
    route: SkybuyTestRoute,
  },
  
];

// travers the all route
moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
