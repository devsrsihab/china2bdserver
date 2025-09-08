import { GlobalPriceRuleServices } from './globalPriceRule.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';

// Get all rules
const getAllRules = catchAsync(async (req, res) => {
  const result = await GlobalPriceRuleServices.getAllRules();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Pricing rules retrieved successfully',
    data: result,
  });
});

// Get rule by ID
const getRuleById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await GlobalPriceRuleServices.getRuleById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Pricing rule retrieved successfully',
    data: result,
  });
});

// Create rule
const createRule = catchAsync(async (req, res) => {
  const result = await GlobalPriceRuleServices.createRule(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Pricing rule created successfully',
    data: result,
  });
});

// Update rule
const updateRule = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await GlobalPriceRuleServices.updateRule(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Pricing rule updated successfully',
    data: result,
  });
});

// Soft delete (forbidden)
const softDeleteRule = catchAsync(async (req, res) => {
  await GlobalPriceRuleServices.softDeleteRule();

  sendResponse(res, {
    statusCode: httpStatus.FORBIDDEN,
    success: false,
    message: 'Global pricing rule cannot be deleted',
    data: null,
  });
});

export const GlobalPriceRuleController = {
  getAllRules,
  getRuleById,
  createRule,
  updateRule,
  softDeleteRule,
};
