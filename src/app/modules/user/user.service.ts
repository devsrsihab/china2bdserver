/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import config from '../../config';
import { TUser } from './user.interface';
import { User } from './user.model';
import AppError from '../../errors/appError';
import httpStatus from 'http-status';

import { TAdmin } from '../admin/admin.interface';
import { Admin } from '../admin/admin.model';

// 🔹 Get all users (excluding soft-deleted)
const getAllUsers = async () => {
  return await User.find({ isDeleted: false });
};

// 🔹 Get user by ID
const getUserById = async (id: string) => {
  return await User.findOne({ _id: id, isDeleted: false });
};

// 🔹 Create a new user
const createUser = async (payload: Partial<TUser>) => {
  // Check if email already exists (not soft deleted)
  const existingUser = await User.findOne({
    email: payload.email,
    isDeleted: false,
  });

  if (existingUser) {
    throw new AppError(httpStatus.CONFLICT, 'Email already exists');
  }

  const newUser = new User(payload);
  return await newUser.save();
};
// 🔹 Update user
const updateUser = async (id: string, payload: Partial<TUser>) => {
  return await User.findOneAndUpdate({ _id: id, isDeleted: false }, payload, { new: true });
};

// 🔹 Soft delete user
const softDeleteUser = async (id: string) => {
  return await User.findByIdAndUpdate(
    id,
    { isDeleted: true, deletedAt: new Date() },
    { new: true },
  );
};

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
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  softDeleteUser,
};
