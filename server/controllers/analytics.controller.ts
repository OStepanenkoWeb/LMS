import { CatchAsyncError } from '../middleware/catchAsyncError'
import { type NextFunction, type Request, type Response } from 'express'
import ErrorHandler from '../utils/errorHandler'
import {
  getCoursesAnalyticsService,
  getOrdersAnalyticsService,
  getUserAnalyticsService
} from '../services/analitics.service'

// get users analytics --- only for admin
export const getUserAnalytics = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getUserAnalyticsService(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})

// get courses analytics --- only for admin
export const getCoursesAnalytics = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getCoursesAnalyticsService(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})

// get orders analytics --- only for admin
export const getOrdersAnalytics = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getOrdersAnalyticsService(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})
