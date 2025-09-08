import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { OrderStatusServices } from './ordersStatus.service';

// Get all order statuses
const getAllOrderStatuses = catchAsync(async (req, res) => {
  const result = await OrderStatusServices.getAllOrderStatuses();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order statuses retrieved successfully',
    data: result,
  });
});

// Get order status by ID
const getOrderStatusById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await OrderStatusServices.getOrderStatusById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order status retrieved successfully',
    data: result,
  });
});

// Create order status
const createOrderStatus = catchAsync(async (req, res) => {
  const result = await OrderStatusServices.createOrderStatus(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Order status created successfully',
    data: result,
  });
});

// Update order status
const updateOrderStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await OrderStatusServices.updateOrderStatus(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order status updated successfully',
    data: result,
  });
});

// Delete (soft) order status
const deleteOrderStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await OrderStatusServices.softDeleteOrderStatus(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order status deleted successfully',
    data: result,
  });
});

export const OrderStatusController = {
  getAllOrderStatuses,
  getOrderStatusById,
  createOrderStatus,
  updateOrderStatus,
  deleteOrderStatus,
};
