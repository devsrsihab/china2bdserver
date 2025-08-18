import express from 'express';
import { AdminController } from './admin.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

router.get('/',auth(USER_ROLE.admin), AdminController.getAllAdmins);
router.get('/:adminId', AdminController.getSingleFacultie);
router.patch('/:adminId', AdminController.updateAdmin);
router.delete('/:adminId', AdminController.deleteAdmin);

export const AdminRoute = router;
