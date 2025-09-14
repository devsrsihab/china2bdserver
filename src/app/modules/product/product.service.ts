import axios, { AxiosResponse } from 'axios';
import config from '../../config';
import AppError from '../../errors/appError';
import httpStatus from 'http-status';

// caching helpers – আপনার utils/cache ফাইল থেকে import করুন
import { getCache, setCache } from '../../utils/cache';

const baseURL = config.otc_base_url!;
const instanceKey = config.otc_instance_key!;

// ----------- Types -----------
export interface Category {
  Id: string;
  Name: string;
  ParentId?: string;
  IsHidden: boolean;
  [key: string]: any;
}

export interface Product {
  Id: string;
  Name: string;
  VendorId: string;
  [key: string]: any;
}

export interface Vendor {
  Id: string;
  Name: string;
  [key: string]: any;
}

export interface ProductListResponse {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    maximumPageCount: number;
  };
  filters: {
    availableSearchMethods: any[];
  };
  data: Product[];
}

// ----------- Helpers -----------
const buildUrl = (path: string, params: Record<string, any> = {}): string => {
  const qs = new URLSearchParams({
    instanceKey,
    language: 'en',
    ...params,
  }).toString();
  return `${baseURL}/${path}?${qs}`;
};

// 1. Get all categories (root only) with cache
const getAllCategories = async (): Promise<Category[]> => {
  const cacheKey = 'categories:root'; // static key for root categories
  const cached = await getCache<Category[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const url = buildUrl('GetRootCategoryInfoList');
    const { data }: AxiosResponse<any> = await axios.get(url);
    if (data?.ErrorCode !== 'Ok') {
      throw new AppError(
        httpStatus.BAD_GATEWAY,
        data?.ErrorDescription || 'Failed to fetch categories',
      );
    }
    const categories: Category[] = (data?.CategoryInfoList?.Content || []).filter(
      (cat: Category) => cat?.IsHidden === false,
    );
    // save in cache for 72h
    await setCache(cacheKey, categories);
    return categories;
  } catch (error: any) {
    throw error instanceof AppError
      ? error
      : new AppError(httpStatus.BAD_GATEWAY, 'Error fetching categories');
  }
};

// 2. Get subcategories by category ID with cache
const getSubcategories = async (categoryId: string): Promise<Category[]> => {
  const cacheKey = `subcategories:${categoryId}`;
  const cached = await getCache<Category[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const url = buildUrl('GetCategorySubcategoryInfoList', {
      parentCategoryId: categoryId,
    });
    const { data }: AxiosResponse<any> = await axios.get(url);
    if (data?.ErrorCode !== 'Ok') {
      throw new AppError(
        httpStatus.BAD_GATEWAY,
        data?.ErrorDescription || 'Failed to fetch subcategories',
      );
    }
    const subcategories: Category[] = (data?.CategoryInfoList?.Content || []).filter(
      (sub: Category) => sub?.IsHidden === false,
    );
    await setCache(cacheKey, subcategories);
    return subcategories;
  } catch (error: any) {
    throw error instanceof AppError
      ? error
      : new AppError(httpStatus.BAD_GATEWAY, 'Error fetching subcategories');
  }
};

// 3. Get categories with subcategories (relies on cached functions above)
const getCategoriesWithSubcategories = async (): Promise<
  (Category & { subcategories: Category[] })[]
> => {
  try {
    const categories = await getAllCategories();
    // each subcategory list will be cached by getSubcategories
    const results = await Promise.allSettled(
      categories.map((cat) => getSubcategories(cat.Id)),
    );

    return categories.map((cat, idx) => {
      const result = results[idx];
      return {
        ...cat,
        subcategories: result.status === 'fulfilled' ? result.value : [],
      };
    });
  } catch (error: any) {
    throw error instanceof AppError
      ? error
      : new AppError(
          httpStatus.BAD_GATEWAY,
          'Error fetching categories with subcategories',
        );
  }
};

// 4. Get products by subcategory with cache
const getProductsBySubcategory = async (
  subCategoryId: string,
  framePosition: number,
  frameSize: number,
): Promise<ProductListResponse> => {

  const cacheKey = `products:${subCategoryId}:page=${framePosition}:size=${frameSize}`;
  const cached = await getCache<ProductListResponse>(cacheKey);
  if (cached) {
    console.log('cached products');
    return cached;
  }

  try {
    const xmlParameters = `<SearchItemsParameters><CategoryId>${subCategoryId}</CategoryId></SearchItemsParameters>`;
    const url = `${baseURL}/BatchSearchItemsFrame?instanceKey=${instanceKey}&language=en&xmlParameters=${xmlParameters}&framePosition=${framePosition}&frameSize=${frameSize}&blockList=AvailableSearchMethods`;

    const { data }: AxiosResponse<any> = await axios.get(url);
    if (data?.ErrorCode !== 'Ok') {
      throw new AppError(
        httpStatus.BAD_GATEWAY,
        data?.ErrorDescription || 'Failed to fetch products',
      );
    }

    const items: Product[] = data?.Result?.Items?.Items?.Content || [];
    const total: number = data?.Result?.Items?.Items?.TotalCount || 0;
    console.log('api data called of products');
    
    const response: ProductListResponse = {
      meta: {
        page: framePosition,
        limit: frameSize,
        total,
        totalPages: Math.ceil(total / frameSize),
        maximumPageCount: data?.Result?.Items?.MaximumPageCount || 0,
      },
      filters: {
        availableSearchMethods: data?.Result?.AvailableSearchMethods?.Content || [],
      },
      data: items,
    };

    await setCache(cacheKey, response);
    return response;
  } catch {
    throw new AppError(httpStatus.BAD_GATEWAY, 'Failed to fetch products');
  }
};

// 5. Get single product info with cache
const getSingleProductById = async (productId: string): Promise<Product | null> => {
  const cacheKey = `product:${productId}`;
  const cached = await getCache<Product | null>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  try {
    const url = buildUrl(
      `BatchGetItemFullInfo?blockList=AvailableSearchMethods&instanceKey=${instanceKey}&language=en`,
      { itemId: productId },
    );
    const { data }: AxiosResponse<any> = await axios.get(url);
    if (data?.ErrorCode !== 'Ok') {
      throw new AppError(
        httpStatus.BAD_GATEWAY,
        data?.ErrorDescription || 'Failed to fetch product info',
      );
    }
    const product: Product | null = data?.Result?.Item || null;
    await setCache(cacheKey, product);
    return product;
  } catch (error: any) {
    throw error instanceof AppError
      ? error
      : new AppError(httpStatus.BAD_GATEWAY, 'Error fetching product info');
  }
};

// 6. Get vendor info with cache
const getVendorById = async (vendorId: string): Promise<Vendor | null> => {
  const cacheKey = `vendor:${vendorId}`;
  const cached = await getCache<Vendor | null>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  try {
    const url = buildUrl('GetVendorInfo', { vendorId });
    const { data }: AxiosResponse<any> = await axios.get(url);
    if (data?.ErrorCode !== 'Ok') {
      throw new AppError(httpStatus.BAD_GATEWAY, 'Failed to fetch vendor info');
    }
    const vendor: Vendor | null = data?.VendorInfo || null;
    await setCache(cacheKey, vendor);
    return vendor;
  } catch {
    throw new AppError(httpStatus.BAD_GATEWAY, 'Failed to fetch vendor info');
  }
};

// Export service with caching built-in
export const ProductService = {
  getAllCategories,
  getSubcategories,
  getProductsBySubcategory,
  getSingleProductById,
  getVendorById,
  getCategoriesWithSubcategories,
};
