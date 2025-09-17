import express, { Request, Response, NextFunction } from 'express';
import { UserController } from './user.controller';
import validateRequest from '../../middlewares/validateRequest';
import { AdminValidations } from '../admin/admin.validation';
import auth from '../../middlewares/auth';
import { USER_ROLE } from './user.constant';
import { UserValidations } from './user.validation';

const router = express.Router();

// Get all users (admin, manager)
router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.manager),
  UserController.getAllUsers,
);

// Get user by ID (admin, manager, user self)
router.get(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.manager, USER_ROLE.user),
  UserController.getUserById,
);

// Create a new user (admin, manager)
router.post(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.manager),
  validateRequest(UserValidations.createUser),
  UserController.createUser,
);

// Update user (admin, manager, user self)
router.put(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.manager, USER_ROLE.user),
  validateRequest(UserValidations.updateUser),
  UserController.updateUser,
);

// Soft delete user (admin only)
router.delete('/:id', auth(USER_ROLE.admin, USER_ROLE.superAdmin), UserController.deleteUser);

// get test route for user
router.get('/usertest', UserController.testMethod);

// admin create
router.post(
  '/create-admin',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin,),
  validateRequest(AdminValidations.createAdminValidationSchema),
  UserController.createAdmin,
);

// get me
router.get('/me', auth(USER_ROLE.admin,USER_ROLE.superAdmin, USER_ROLE.user), UserController.getMe);

// change status
router.patch(
  '/change-status/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin,),
  validateRequest(UserValidations.changeStatusValidationSchema),
  UserController.changeStatus,
);

export const UserRoute = router;
