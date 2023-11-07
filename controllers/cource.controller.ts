import { type NextFunction, type Request, type Response } from 'express'
import { CatchAsyncError } from '../middleware/catchAsyncError'
import ErrorHandler from '../utils/errorHandler'
import {
  addAnswerQuestionService,
  addQuestionService, addReplyToReviewService, addReviewCourseService,
  createCourse, deleteCourseService,
  getAllCoursesList, getAllFullCoursesService,
  getCourseById,
  getCourseByUserId,
  updateCourse
} from '../services/cource.service'

// upload course
export const uploadCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createCourse(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})

// edit course
export const editCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updateCourse(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})

// get single course --- without purchasing
export const getSingleCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getCourseById(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})

// get all course --- without purchasing
export const getAllCourses = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getAllCoursesList(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})

// get course content -- only for valid user
export const getCourseByUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getCourseByUserId(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})

// add questions in course

export const addQuestion = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await addQuestionService(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})

// add answer in course question
export const addAnswerQuestion = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await addAnswerQuestionService(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})

// add review in course
export const addReviewCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await addReviewCourseService(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})

// add reply in review

export const addReplyToReview = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await addReplyToReviewService(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})

// get all courses
export const getAllFullCourses = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getAllFullCoursesService(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})

// delete course
export const deleteCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteCourseService(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})
