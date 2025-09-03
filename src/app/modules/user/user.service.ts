/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import config from '../../config';
import { TUser } from './user.interface';
import { User } from './user.model';
import { generatAdminId } from './user.utils';
import AppError from '../../errors/appError';
import httpStatus from 'http-status';

import { TAdmin } from '../admin/admin.interface';
import { Admin } from '../admin/admin.model';

// create Admin
const createAdminToDB = async (password: string, payload: TAdmin) => {
  // create a user object
  const userData: Partial<TUser> = {};

  // if the password empty
  userData.password = password || (config.user_default_password as string);
  // set user role
  userData.role = 'admin';
  // create admin email
  userData.email = payload.email;
  // start session
  const session = await mongoose.startSession();

  try {
    // start session
    session.startTransaction();

    // create a user transaction 01
    const newUser = await User.create([userData], { session }); // transaction return array
    // if created the user successfully then create the user
    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create user');
    }

    // set user id in student id field
    payload.id = newUser[0].id; // embating id

    // set student user field data
    payload.user = newUser[0]._id; // reference id

    const newAdmin = await Admin.create([payload], { session });

    if (!newAdmin.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create Admin');
    }

    await session.commitTransaction();
    await session.endSession();

    return newAdmin;
  } catch (error: unknown) {
    await session.abortTransaction();
    await session.endSession();
    if (error instanceof Error) {
      throw new AppError(httpStatus.BAD_REQUEST, error.message);
    } else {
      throw new AppError(httpStatus.BAD_REQUEST, 'Unknown error occurred');
    }
  }
};

// get me servcies
const getMeFromDB = async (email: string, role: string) => {
  let result = null;

  // if user
  if (role === 'student') {
    result = await User.findOne({ id: email });
  }

  // if faculty
  if (role === 'faculty') {
    result = await User.findOne({ id: email });
  }

  // if admin
  if (role === 'admin') {
    result = await User.findOne({ id: email });
  }

  return result;
};

// change status
const changeStatus = async (id: string, payload: { status: string }) => {
  const result = await User.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

export const UserServices = {
  createAdminToDB,
  getMeFromDB,
  changeStatus,
};
