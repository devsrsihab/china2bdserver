import { ZodError, ZodIssue } from 'zod';
import { TErrorSources, TGenericeErrorResponse } from '../interface/error';

// hanlde zod error
const hanldeZodError = (err: ZodError): TGenericeErrorResponse => {
  // error sources
  const errorSources: TErrorSources = err.issues.map((issue: ZodIssue) => {
    return {
      path: issue?.path[issue.path.length - 1],
      message: issue?.message,
    };
  });

  // return hanldezodeError
  const statusCode = 400;
  return {
    statusCode,
    message: 'Validation error',
    errorSources,
  };
};

export default hanldeZodError;
