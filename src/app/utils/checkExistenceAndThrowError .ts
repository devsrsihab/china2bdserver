/* eslint-disable @typescript-eslint/no-explicit-any */
import { Model, Types } from 'mongoose';
import AppError from '../errors/appError';
import httpStatus from 'http-status';

const checkExistenceAndThrowError = async (
  model: Model<any>,
  id: Types.ObjectId | string,
  message: string,
  isObjectId = true,
) => {
  const isExist = isObjectId ? await model.findById(id) : await model.findOne({ id });

  if (!isExist) {
    throw new AppError(httpStatus.NOT_FOUND, message);
  }
  return isExist;
};

export default checkExistenceAndThrowError;
