import axios, { AxiosResponse } from 'axios';
import config from '../../config';
import AppError from '../../errors/appError';
import httpStatus from 'http-status';

const baseURL = config.otc_base_url!;
const instanceKey = config.otc_instance_key!;


// ----------- Types -----------
export interface Category {
  Id: string;
  Name: string;
  ParentId?: string;
  IsHidden: boolean;
  [key: string]: any; // allow extra fields from API
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
  const qs = new URLSearchParams({ instanceKey, language: 'en', ...params }).toString();
  return `${baseURL}/${path}?${qs}`;
};

// 1. Get all categories (root only)
const getAllCategories = async (): Promise<Category[]> => {
  try {
    const url = buildUrl('GetRootCategoryInfoList');
    const { data }: AxiosResponse<any> = await axios.get(url);

    if (data?.ErrorCode !== 'Ok') {
      throw new AppError(httpStatus.BAD_GATEWAY, data?.ErrorDescription || 'Failed to fetch categories');
    }

    return (data?.CategoryInfoList?.Content || []).filter(
      (cat: Category) => cat?.IsHidden === false
    );
  } catch (error: any) {
    throw error instanceof AppError
      ? error
      : new AppError(httpStatus.BAD_GATEWAY, 'Error fetching categories');
  }
};

// 2. Get subcategories by category ID
const getSubcategories = async (categoryId: string): Promise<Category[]> => {
  try {
    const url = buildUrl('GetCategorySubcategoryInfoList', { parentCategoryId: categoryId });
    const { data }: AxiosResponse<any> = await axios.get(url);

    if (data?.ErrorCode !== 'Ok') {
      throw new AppError(httpStatus.BAD_GATEWAY, data?.ErrorDescription || 'Failed to fetch subcategories');
    }

    return (data?.CategoryInfoList?.Content || []).filter(
      (sub: Category) => sub?.IsHidden === false
    );
  } catch (error: any) {
    throw error instanceof AppError
      ? error
      : new AppError(httpStatus.BAD_GATEWAY, 'Error fetching subcategories');
  }
};

// 3. Get categories with subcategories
const getCategoriesWithSubcategories = async (): Promise<(Category & { subcategories: Category[] })[]> => {
  try {
    const categories = await getAllCategories();

    const results = await Promise.allSettled(
      categories.map(cat => getSubcategories(cat.Id))
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
      : new AppError(httpStatus.BAD_GATEWAY, 'Error fetching categories with subcategories');
  }
};

// 4. Get products by subcategory
const getProductsBySubcategory = async (
  subCategoryId: string,
  framePosition: number,
  frameSize: number,
): Promise<ProductListResponse> => {
  try {
    const xmlParameters = `<SearchItemsParameters><CategoryId>${subCategoryId}</CategoryId></SearchItemsParameters>`;

    const url = `${baseURL}/BatchSearchItemsFrame?instanceKey=${instanceKey}&language=en&xmlParameters=${xmlParameters}&framePosition=${framePosition}&frameSize=${frameSize}&blockList=AvailableSearchMethods`;

    const { data }: AxiosResponse<any> = await axios.get(url);

    if (data?.ErrorCode !== "Ok") {
      throw new AppError(httpStatus.BAD_GATEWAY, data?.ErrorDescription || "Failed to fetch products");
    }

    const items: Product[] = data?.Result?.Items?.Items?.Content || [];
    const total: number = data?.Result?.Items?.Items?.TotalCount || 0;

    return {
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
  } catch {
    throw new AppError(httpStatus.BAD_GATEWAY, "Failed to fetch products");
  }
};



// 5. Get single product info
const getSingleProductById = async (productId: string): Promise<Product | null> => {
  try {
    const url = buildUrl(`BatchGetItemFullInfo?blockList=AvailableSearchMethods&instanceKey=${instanceKey}&language=en`, { itemId: productId });
    const { data }: AxiosResponse<any> = await axios.get(url);

    if (data?.ErrorCode !== 'Ok') {
      throw new AppError(httpStatus.BAD_GATEWAY, data?.ErrorDescription || 'Failed to fetch product info');
    }

    return data?.Result?.Item || null;
  } catch (error: any) {
    throw error instanceof AppError
      ? error
      : new AppError(httpStatus.BAD_GATEWAY, 'Error fetching product info');
  }
};

// 6. Get vendor info
const getVendorById = async (vendorId: string): Promise<Vendor | null> => {
  try {
    const url = buildUrl('GetVendorInfo', { vendorId });
    const { data }: AxiosResponse<any> = await axios.get(url);

    if (data?.ErrorCode !== 'Ok') {
      throw new AppError(httpStatus.BAD_GATEWAY, 'Failed to fetch vendor info');
    }

    return data?.VendorInfo || null;
  } catch {
    throw new AppError(httpStatus.BAD_GATEWAY, 'Failed to fetch vendor info');
  }
};

// Export service
export const ProductService = {
  getAllCategories,
  getSubcategories,
  getProductsBySubcategory,
  getSingleProductById,
  getVendorById,
  getCategoriesWithSubcategories,
};
