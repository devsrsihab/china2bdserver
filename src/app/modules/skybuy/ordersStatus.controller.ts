import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

// Get only sidebarCategories div HTML
const getAllSkybuyTest = catchAsync(async (req, res) => {
  // Fetch the website HTML
  const response = await fetch("https://skybuybd.com/");
  const html = await response.text();

  // Load HTML into cheerio
  const $ = cheerio.load(html);

  // Extract the div with class "sidebarCategories"
  const sidebarHtml = $('.sidebarCategories').html();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Sidebar categories retrieved successfully',
    data: sidebarHtml,
  });
});

export const OrderStatusController = {
  getAllSkybuyTest,
};
