import axios from 'axios';
import config from '../../config';
import AppError from '../../errors/appError';
import httpStatus from 'http-status';

const baseURL = config.otc_base_url;
const instanceKey = config.otc_instance_key;

// 1. Get all categories
const getAllCategories = async () => {
  try {
    const url = `${baseURL}/GetRootCategoryInfoList?instanceKey=${instanceKey}&language=en`;
    const { data } = await axios.get(url);

    if (data?.ErrorCode !== 'Ok') {
      const message =
        data?.ErrorDescription || 'Failed to fetch categories from provider';
      throw new AppError(httpStatus.BAD_GATEWAY, message);
    }

    return data?.CategoryInfoList?.Content || [];
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error; // preserve upstream API error
    }
    throw new AppError(httpStatus.BAD_GATEWAY, 'Error fetching categories');
  }
};


// 2. Get subcategories by category ID
const getSubcategories = async (categoryId: string) => {
  try {
    const url = `${baseURL}/GetCategorySubcategoryInfoList?instanceKey=${instanceKey}&language=en&parentCategoryId=${categoryId}`;
    const { data } = await axios.get(url);

    if (data?.ErrorCode !== 'Ok') {
      const message =
        data?.ErrorDescription || 'Failed to fetch subcategories from provider';
      throw new AppError(httpStatus.BAD_GATEWAY, message);
    }

    return data?.CategoryInfoList?.Content || [];
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(httpStatus.BAD_GATEWAY, 'Error fetching subcategories');
  }
};


// 3. Get product list under subcategory
const getProductsBySubcategory = async (
  subCategoryId: string,
  framePosition: number,
  frameSize: number,
) => {
  try {
    const xmlParameters = `<SearchItemsParameters><CategoryId>${subCategoryId}</CategoryId></SearchItemsParameters>`;
    const url = `${baseURL}/BatchSearchItemsFrame?instanceKey=${instanceKey}&language=en&xmlParameters=${encodeURIComponent(
      xmlParameters,
    )}&framePosition=${framePosition}&frameSize=${frameSize}&blockList=AvailableSearchMethods`;

    const { data } = await axios.get(url);

    if (data?.ErrorCode !== 'Ok') {
     const message =
        data?.ErrorDescription || 'Failed to fetch products from provider';
      throw new AppError(httpStatus.BAD_GATEWAY, message);
    }

    const items = data?.Result?.Items?.Items?.Content || [];
    const total = data?.Result?.Items?.Items?.TotalCount || 0;
    const maxPages = data?.Result?.Items?.MaximumPageCount || 0;
    const availableSearchMethods =
      data?.Result?.AvailableSearchMethods?.Content || [];

    return {
      meta: {
        page: framePosition,
        limit: frameSize,
        total,
        totalPages: Math.ceil(total / frameSize),
        maximumPageCount: maxPages,
      },
      filters: {
        availableSearchMethods,
      },
      data: items,
    };
  } catch (error) {
    throw new AppError(httpStatus.BAD_GATEWAY, 'Failed to fetch products');
  }
};




// 4. Get single product info
const getSingleProductById = async (productId: string) => {
  try {
    const url = `${baseURL}/BatchGetItemFullInfo?instanceKey=${instanceKey}&blockList=&language=en&itemId=${productId}`;

    const { data } = await axios.get(url);

    if (data?.ErrorCode !== 'Ok') {
      // Use API's own error description if available
      const message = data?.ErrorDescription || 'Failed to fetch product info';
      throw new AppError(httpStatus.BAD_GATEWAY, message);
    }

    return data?.Result?.Item || null;
  } catch (error: any) {
    // If it's already our AppError, just throw it
    if (error instanceof AppError) {
      throw error;
    }
    // Otherwise fallback
    throw new AppError(httpStatus.BAD_GATEWAY, 'Error fetching product info');
  }
};



// 5. Get vendor info
const getVendorById = async (vendorId: string) => {
  try {
    const url = `${baseURL}/GetVendorInfo?language=en&instanceKey=${instanceKey}&vendorId=${vendorId}`;
    const { data } = await axios.get(url);

    if (data?.ErrorCode !== 'Ok') {
      throw new AppError(httpStatus.BAD_GATEWAY, 'Failed to fetch vendor info');
    }

    return data?.VendorInfo || null;
  } catch (error) {
    throw new AppError(httpStatus.BAD_GATEWAY, 'Failed to fetch vendor info');
  }
};


export const ProductService = {
  getAllCategories,
  getSubcategories,
  getProductsBySubcategory,
  getSingleProductById,
  getVendorById,
};
