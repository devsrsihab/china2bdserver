import mongoose from 'mongoose';
import { TErrorSources, TGenericeErrorResponse } from '../interface/error';


const handleValidationError = (err: mongoose.Error.ValidationError): TGenericeErrorResponse => {
  const errorSources: TErrorSources = Object.values(err.errors).map(
    (val: mongoose.Error.ValidatorError | mongoose.Error.CastError) => {
      return {
        path: val?.path,
        message: val?.message,
      };
    },
  );

  // return hanldezodeError
  const statusCode = 400;
  return {
    statusCode,
    message: 'Validation error',
    errorSources,
  };
};

export default handleValidationError;
