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
const getProductsByTitle = async (
  keyword: string,
  framePosition: number,
  frameSize: number,
): Promise<ProductListResponse> => {

  console.log('keyword ==>', keyword , 'fram size ==>', frameSize, 'page ==>', framePosition);
  

  const cacheKey = `products:${keyword}:page=${framePosition}:size=${frameSize}`;
  const cached = await getCache<ProductListResponse>(cacheKey);
  if (cached) {
    console.log('cached products');
    return cached;
  }



  try {
    const xmlParameters = `<SearchItemsParameters><ItemTitle>${keyword}</ItemTitle></SearchItemsParameters>`;
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

/**
 * 7) Get "Popular" products with cache
 * Mirrors the meta/data shape used by getProductsByTitle
 */
// 7) Popular products (SearchRatingListItems) — page index -> offset
const getPopularProducts = async (
  framePosition: number = 0,   // treat as 0-based page index from client
  frameSize: number = 40,
): Promise<ProductListResponse> => {
  // normalize & clamp
  const pageIndex = Number.isFinite(framePosition) ? Math.max(0, framePosition) : 0;
  const size      = Number.isFinite(frameSize)     ? Math.min(100, Math.max(1, frameSize)) : 40;

  // OTAPI expects offset, not page index
  const offset = pageIndex * size;

  const cacheKey = `popular:page=${pageIndex}:size=${size}`;
  const cached = await getCache<ProductListResponse>(cacheKey);
  if (cached) return cached;

  try {
    const xmlSearchParameters =
      `<RatingListItemSearchParameters>` +
      `<ItemRatingType>Popular</ItemRatingType>` +
      `</RatingListItemSearchParameters>`;

    // buildUrl URL-encodes for us
    const url = buildUrl("SearchRatingListItems", {
      xmlSearchParameters,
      framePosition: offset, // <-- offset, not page index
      frameSize: size,
    });

    const { data }: AxiosResponse<any> = await axios.get(url);
    // Debug (optional):
    // console.log("Popular products API response:", { hasErrorCode: data?.ErrorCode, url });

    if (data?.ErrorCode && data.ErrorCode !== "Ok") {
      throw new AppError(
        httpStatus.BAD_GATEWAY,
        data?.ErrorDescription || "Failed to fetch popular products",
      );
    }

    // Tolerate small schema differences across OTAPI responses
    const itemsContent =
      data?.Result?.Items?.Items?.Content ??
      data?.OtapiItemInfoSubList?.Content ??
      data?.Result?.Content ??
      data?.Content ??
      [];

    const totalCount =
      data?.Result?.Items?.Items?.TotalCount ??
      data?.OtapiItemInfoSubList?.TotalCount ??
      data?.Result?.TotalCount ??
      data?.TotalCount ??
      (Array.isArray(itemsContent) ? itemsContent.length : 0);

    const maximumPageCount =
      data?.Result?.Items?.MaximumPageCount ??
      data?.MaximumPageCount ??
      0;

    const items: Product[] = itemsContent;

    const response: ProductListResponse = {
      meta: {
        page: pageIndex,                            // keep page index for the client
        limit: size,
        total: totalCount,
        totalPages: Math.ceil((totalCount || 0) / size),
        maximumPageCount,
      },
      filters: {
        availableSearchMethods:
          data?.Result?.AvailableSearchMethods?.Content ?? [],
      },
      data: items,
    };

    await setCache(cacheKey, response); // reuse your default TTL (e.g., 72h)
    return response;
  } catch (error: any) {
    throw error instanceof AppError
      ? error
      : new AppError(httpStatus.BAD_GATEWAY, "Error fetching popular products");
  }
};


// Export service with caching built-in
export const ProductService = {
  getAllCategories,
  getSubcategories,
  getProductsByTitle,
  getSingleProductById,
  getVendorById,
  getCategoriesWithSubcategories,
  getPopularProducts
};
