import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { courseSearchAbleFields } from './course.constant';
import { TCourse, TCourseFaculty } from './course.interface';
import { Course, CourseFaculty } from './course.model';
import AppError from '../../errors/appError';
import httpStatus from 'http-status';

// create
const createCourseIntoDB = async (payload: TCourse) => {
  const result = await Course.create(payload);
  return result;
};

// get all
const getAllCourseFromDB = async (query: Record<string, unknown>) => {
  const courseQuery = new QueryBuilder(Course.find().populate('preRequisiteCourse.course'), query)
    .search(courseSearchAbleFields)
    .filter()
    .sort()
    .paginate()
    .fields();
  const result = await courseQuery.modelQuery;
  const meta = await courseQuery.countTotal();
  return {
    meta,
    result,
  };
};

// get single
const getSingleCourseFromDB = async (id: string) => {
  const result = await Course.findById(id).populate('preRequisiteCourse.course');
  return result;
};

// update
const updateCourseToDB = async (id: string, payload: Partial<TCourse>) => {
  const { preRequisiteCourse, ...courseRemainingData } = payload;

  // start session and transaction
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // step 1. basic data update
    const updatedBasicCourseInfo = await Course.findByIdAndUpdate(id, courseRemainingData, {
      new: true,
      runValidators: true,
      session,
    });

    if (!updatedBasicCourseInfo) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update Basic Course Data');
    }

    // step 2. 3
    if (preRequisiteCourse && preRequisiteCourse.length > 0) {
      // step 2. filter deleted field
      const deletedPreRequisites = preRequisiteCourse
        .filter((el) => el.course && el.isDeleted)
        .map((el) => el.course);

      const deletedPreRequisiteCourses = await Course.findByIdAndUpdate(
        id,
        {
          $pull: { preRequisiteCourse: { course: { $in: deletedPreRequisites } } },
        },
        { new: true, runValidators: true, session },
      );

      if (!deletedPreRequisiteCourses) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update delete Course Data');
      }

      // step 3. filter for new data insert
      const newPreRequisites = preRequisiteCourse.filter((el) => el.course && !el.isDeleted);

      const newPreRequisitesCourses = await Course.findByIdAndUpdate(
        id,
        {
          $addToSet: { preRequisiteCourse: { $each: newPreRequisites } },
        },
        { new: true, runValidators: true, session },
      );

      if (!newPreRequisitesCourses) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update new  Course Data');
      }

      const result = await Course.findById(id).populate('preRequisiteCourse.course');
      return result;
    }
    await session.commitTransaction();
    await session.endSession();
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update new  Course Data');
  }
};

// deleted
const deleteCourseFromDB = async (id: string) => {
  const result = await Course.findOneAndUpdate({ _id: id }, { isDeleted: true }, { new: true });
  return result;
};

// assign faculties// create
const assignFacultyWithCoursetoDB = async (id: string, payload: Partial<TCourseFaculty>) => {
  const result = await CourseFaculty.findByIdAndUpdate(
    id,
    {
      course: id,
      $addToSet: { faculties: { $each: payload } },
    },
    { upsert: true, new: true },
  );
  return result;
};

// get course by faculties
const getCourseFacultiesFromDB = async (courseId: string) => {
  const result = await CourseFaculty.findOne({ course: courseId }).populate('faculties');
  return result;
};

// assign faculties// create
const removeFacultyWithCoursetoDB = async (id: string, payload: Partial<TCourseFaculty>) => {
  const result = await CourseFaculty.findByIdAndUpdate(
    id,
    {
      $pull: { faculties: { $in: payload } },
    },
    { new: true },
  );
  return result;
};

// export all
export const CourseServices = {
  createCourseIntoDB,
  getAllCourseFromDB,
  getSingleCourseFromDB,
  updateCourseToDB,
  deleteCourseFromDB,
  assignFacultyWithCoursetoDB,
  getCourseFacultiesFromDB,
  removeFacultyWithCoursetoDB,
};
