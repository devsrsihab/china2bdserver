/* eslint-disable @typescript-eslint/no-explicit-any */

import httpStatus from "http-status";
import AppError from "../../errors/appError";
import { TOrderStatus } from "./ordersStatus.interface";
import { OrderStatus } from "./ordersStatus.model";


// Get all order statuses
const getAllOrderStatuses = async () => {
  return await OrderStatus.find({ isDeleted: false }).sort({ sortOrder: 1 });
};

// Get single order status by ID
const getOrderStatusById = async (id: string) => {
  return await OrderStatus.findById(id).where({ isDeleted: false });
};

// Create new order status
const createOrderStatus = async (payload: TOrderStatus) => {
  // Normalize name (to lowercase for duplicate check)
  const normalizedName = payload.name.trim().toLowerCase();

  // Check if same name already exists (case-insensitive)
  const existing = await OrderStatus.findOne({
    name: { $regex: new RegExp(`^${normalizedName}$`, 'i') }, // exact match ignoring case
    isDeleted: false,
  });

  if (existing) {
    throw new AppError(httpStatus.CONFLICT, `Order status "${payload.name}" already exists`);
  }

  // Save with normalized name
  const newOrderStatus = new OrderStatus({
    ...payload,
    name: normalizedName, // store lowercase
  });

  return await newOrderStatus.save();
};

// Update order status
const updateOrderStatus = async (id: string, payload: Partial<TOrderStatus>) => {
  return await OrderStatus.findByIdAndUpdate(
    id,
    { ...payload },
    { new: true },
  ).where({ isDeleted: false });
};

// Soft delete order status
const softDeleteOrderStatus = async (id: string) => {
  return await OrderStatus.findByIdAndUpdate(
    id,
    { isDeleted: true, deletedAt: new Date() },
    { new: true },
  );
};

export const OrderStatusServices = {
  getAllOrderStatuses,
  getOrderStatusById,
  createOrderStatus,
  updateOrderStatus,
  softDeleteOrderStatus,
};
