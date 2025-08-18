import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AdminServices } from './admin.service';

// get all getAdmin conroller
const getAllAdmins = catchAsync(async (req, res) => {
  const query = req.query;
  // console.log('testing', req.user)
  const result = await AdminServices.getAllAdminsFromDB(query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'admins get successfully',
    meta: result.meta,
    data: result.result,
  });
});

// get single admin controller
const getSingleFacultie = catchAsync(async (req, res) => {
  const { adminId } = req.params;
  const result = await AdminServices.getSingleAdminFromDB(adminId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'single admin get successfully',
    data: result || 'no data found',
  });
});

// update student controller
const updateAdmin = catchAsync(async (req, res) => {
  const { adminId } = req.params;
  const { admin } = req.body;
  const result = await AdminServices.updateAdminToDB(adminId, admin);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'admin updated successfully',
    data: result || 'no data found',
  });
});

// delete admin
const deleteAdmin = catchAsync(async (req, res) => {
  const { adminId } = req.params;
  const result = AdminServices.deleteAdminFromDB(adminId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'admin deleted successfully',
    data: result,
  });
});

export const AdminController = {
  getAllAdmins,
  getSingleFacultie,
  updateAdmin,
  deleteAdmin,
};
