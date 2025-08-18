/* eslint-disable @typescript-eslint/no-explicit-any */
import { TErrorSources, TGenericeErrorResponse } from '../interface/error';

const handleDuplicateError = (err:any): TGenericeErrorResponse => {
  
    const match = err.errorResponse.errmsg.match(/"([^"]*)"/);
    const extractMessage = match && match[1];
  
    const errorSources: TErrorSources = [
      {
        path: err?.keyPattern,
        message: `${extractMessage} already exists`,
      },
    ];

  // return hanldezodeError
  const statusCode = 400;
  return {
    statusCode,
    message: 'Duplicate error',
    errorSources,
  };
};

export default handleDuplicateError;
