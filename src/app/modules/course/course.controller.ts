import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CourseServices } from './course.service';

// create
const createCourse = catchAsync(async (req, res) => {
  const result = await CourseServices.createCourseIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'course created successfully',
    data: result,
  });
});

// get all
const getAllCourses = catchAsync(async (req, res) => {
  //   const query = req.query;
  const result = await CourseServices.getAllCourseFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'course get successfully',
    meta: result.meta,
    data: result.result,
  });
});

// get single
const getSingleCourse = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const result = await CourseServices.getSingleCourseFromDB(courseId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'single course get successfully',
    data: result || 'no data found',
  });
});

// update student controller
const updateCourse = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const course = req.body;
  const result = await CourseServices.updateCourseToDB(courseId, course);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'course updated successfully',
    data: result || 'no data found',
  });
});

// delete
const deleteCourse = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  //   console.log(courseId);
  const result = await CourseServices.deleteCourseFromDB(courseId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'course deleted successfully',
    data: result,
  });
});

// assigne faculty
const assignFacultiesWithCourse = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const { faculties } = req.body;
  //   console.log(courseId);
  const result = await CourseServices.assignFacultyWithCoursetoDB(courseId, faculties);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'course assign to Faculty successfully',
    data: result,
  });
});

// get course by faculties
const getCourseFaculties = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CourseServices.getCourseFacultiesFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Course faculties  successfully',
    data: result || 'no data found',
  });
});

// remove faculty
const removeFacultiesWithCourse = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const { faculties } = req.body;
  //   console.log(courseId);
  const result = await CourseServices.removeFacultyWithCoursetoDB(courseId, faculties);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'course remove to Faculty successfully',
    data: result,
  });
});

// export all
export const CourseControllers = {
  createCourse,
  getAllCourses,
  getSingleCourse,
  updateCourse,
  deleteCourse,
  assignFacultiesWithCourse,
  getCourseFaculties,
  removeFacultiesWithCourse,
};
