import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ProductService } from './product.service';
import httpStatus from 'http-status';

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getAllCategories();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Categories fetched successfully',
    data: result,
  });
});

const getSubcategories = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getSubcategories(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subcategories fetched successfully',
    data: result,
  });
});

const getProductsByTitle = catchAsync(async (req: Request, res: Response) => {
  const  keyword  = req.query.keyword as string;
  const { framePosition = 0, frameSize = 10 } = req.query;
  

  const result = await ProductService.getProductsByTitle(
    keyword,
    Number(framePosition),
    Number(frameSize),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Products fetched successfully',
    meta: result.meta,
    // filters: result.filters,
    data: result.data,
  });
});



const getSingleProductById = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getSingleProductById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product details fetched successfully',
    data: result,
  });
});

const getVendorById = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getVendorById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vendor info fetched successfully',
    data: result,
  });
});

const getCategoriesWithSubcategories = catchAsync(async (req, res) => {
  const result = await ProductService.getCategoriesWithSubcategories();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Categories with subcategories fetched successfully",
    data: result,
  });
});


const getPopularProducts = catchAsync(async (req: Request, res: Response) => {
  const { framePosition = '0', frameSize = '40' } = req.query;
  console.log('hitting the api ');
  

  // sanitize incoming values
  const page = Math.max(0, Number(framePosition) || 0);
  const size = Math.min(100, Math.max(1, Number(frameSize) || 40));

  const result = await ProductService.getPopularProducts(page, size);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Popular products fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const ProductController = {
  getAllCategories,
  getSubcategories,
  getProductsByTitle,
  getSingleProductById,
  getVendorById,
  getCategoriesWithSubcategories, 
  getPopularProducts
};
