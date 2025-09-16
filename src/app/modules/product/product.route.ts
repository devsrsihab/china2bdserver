import express from 'express';
import { ProductController } from './product.controller';

const router = express.Router();

// 1. Get all categories
router.get('/categories', ProductController.getAllCategories);

// 2. Get subcategories by category ID
router.get('/categories/:id/subcategories', ProductController.getSubcategories);

// 3. Get product list under subcategory
router.get('/search', ProductController.getProductsByTitle);

// 4. Get single product info
router.get('/single/:id', ProductController.getSingleProductById);

router.get('/categories-with-subcategories', ProductController.getCategoriesWithSubcategories);
// 6. Popular products  ✅
router.get('/popular', ProductController.getPopularProducts);
// 5. Get vendor info
router.get('/vendors/:id', ProductController.getVendorById);

export const ProductRoutes = router;
