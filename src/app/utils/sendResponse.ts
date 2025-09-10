import { Response } from 'express';

export type TMeta = {
  page: number
  limit: number
  total: number
  totalPages?: number
};
type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  meta?: TMeta;
  data: T;
  filters?: Record<string, any>;
};

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  res.status(data?.statusCode).json({
    success: data.success,
    message: data.message,
    meta: data.meta,
    data: data.data,
    filters: data.filters,
  });
};

export default sendResponse;
