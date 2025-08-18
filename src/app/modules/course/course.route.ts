import express from 'express';
import { CourseControllers } from './course.controller';
import validateRequest from '../../middlewares/validateRequest';
import { CourseValidations } from './course.validation';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

router.post(
  '/create-course',
  auth(USER_ROLE.admin),
  validateRequest(CourseValidations.createCourseValidationSchema),
  CourseControllers.createCourse,
);
router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.faculty, USER_ROLE.student),
  CourseControllers.getAllCourses,
);
router.get('/:courseId', CourseControllers.getSingleCourse);
router.patch(
  '/:courseId',
  auth(USER_ROLE.admin),
  validateRequest(CourseValidations.updateCourseValdiationSchema),
  CourseControllers.updateCourse,
);
router.delete('/:courseId', auth(USER_ROLE.admin), CourseControllers.deleteCourse);

// assign faculty
router.put(
  '/:courseId/assign-faculties',
  auth(USER_ROLE.admin),
  validateRequest(CourseValidations.FacultyWithCouseValidaionSchema),
  CourseControllers.assignFacultiesWithCourse,
);

// get course by faculties
router.get('/:id/getfaculties', CourseControllers.getCourseFaculties);

// remove faculty
router.delete(
  '/:courseId/remove-faculties',
  auth(USER_ROLE.admin),
  validateRequest(CourseValidations.FacultyWithCouseValidaionSchema),
  CourseControllers.removeFacultiesWithCourse,
);

export const CourseRoute = router;
