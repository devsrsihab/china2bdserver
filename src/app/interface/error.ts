export type TErrorSources = {
  path: string | number;
  message: string;
}[];

export type TGenericeErrorResponse = {
  statusCode: number;
  message: string;
  errorSources: TErrorSources;
};