import { CatchAsyncError } from '../middleware/catchAsyncError'
import NotificationModel, { type INotification } from '../models/notification.model'
import { type NextFunction, type Request, type Response } from 'express'
import ErrorHandler from '../utils/errorHandler'

// get all notification
export const getNotificationsService = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const notifications = await NotificationModel.find().sort({ createdAt: -1 })

  res.status(201).json({
    success: true,
    notifications
  })
})

// update notification status
export const updateNotificationsService = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const notification = await NotificationModel.findById(req.params.id) as INotification

  if (!notification) {
    next(new ErrorHandler('Notification not found', 400))
    return
  }

  notification.status = notification.status ? 'read' : notification.status

  await notification.save()
  res.status(201).json({
    success: true,
    notification
  })
})
