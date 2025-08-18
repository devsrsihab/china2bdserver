import mongoose from 'mongoose';
import { TErrorSources, TGenericeErrorResponse } from '../interface/error';

const handleCastError = (err: mongoose.Error.CastError): TGenericeErrorResponse => {
  const errorSources: TErrorSources = [
    {
      path: err?.path,
      message: err?.message,
    },
  ];

  // return hanldezodeError
  const statusCode = 400;
  return {
    statusCode,
    message: 'Invalid ID',
    errorSources,
  };
};

export default handleCastError;
