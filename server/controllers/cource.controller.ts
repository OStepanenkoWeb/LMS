import { type NextFunction, type Request, type Response } from 'express'
import { CatchAsyncError } from '../middleware/catchAsyncError'
import ErrorHandler from '../utils/errorHandler'
import {
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
    next(new ErrorHandler(error.message, 400))
  }
})

// edit course
export const editCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    updateCourse(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 400))
  }
})

// get single course --- without purchasing
export const getSingleCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    getCourseById(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 400))
  }
})

// get all course --- without purchasing
export const getAllCourses = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    getAllCoursesList(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 400))
  }
})

// get course content -- only for valid user
export const getCourseByUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    getCourseByUserId(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 400))
  }
})
