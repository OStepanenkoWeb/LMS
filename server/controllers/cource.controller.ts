import { type NextFunction, type Request, type Response } from 'express'
import { CatchAsyncError } from '../middleware/catchAsyncError'
import ErrorHandler from '../utils/errorHandler'
import { createCourse, updateCourse } from '../services/cource.service'

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
