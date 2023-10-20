import { type NextFunction, type Request, type Response } from 'express'
import { CatchAsyncError } from '../middleware/catchAsyncError'
import ErrorHandler from '../utils/errorHandler'
import {
  addAnswerQuestionService,
  addQuestionService,
  createCourse,
  getAllCoursesList,
  getCourseById,
  getCourseByUserId,
  updateCourse
} from '../services/cource.service'

// upload course
export const uploadCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    createCourse(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})

// edit course
export const editCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    updateCourse(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})

// get single course --- without purchasing
export const getSingleCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    getCourseById(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})

// get all course --- without purchasing
export const getAllCourses = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    getAllCoursesList(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})

// get course content -- only for valid user
export const getCourseByUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    getCourseByUserId(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})

// add questions in course

export const addQuestion = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    addQuestionService(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})

// add answer in course question
export const addAnswerQuestion = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    addAnswerQuestionService(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})
