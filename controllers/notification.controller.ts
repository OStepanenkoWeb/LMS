import { type NextFunction, type Request, type Response } from 'express'
import { CatchAsyncError } from '../middleware/catchAsyncError'
import ErrorHandler from '../utils/errorHandler'
import { getNotificationsService, updateNotificationsService } from '../services/notification.service'

// get notification
export const getNotifications = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    getNotificationsService(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})

// update notification status
export const updateNotifications = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    updateNotificationsService(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})
