import { CatchAsyncError } from '../middleware/catchAsyncError'
import NotificationModel, { type INotification } from '../models/notification.model'
import { type NextFunction, type Request, type Response } from 'express'
import ErrorHandler from '../utils/errorHandler'
import cron from 'node-cron'

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

  const notifications = await NotificationModel.find().sort({
    createdAt: -1,
  })

  res.status(201).json({
    success: true,
    notification
  })
})

// delete notification
cron.schedule('0 0 0 * * *', async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  await NotificationModel.deleteMany({ status: 'read', createdAt: { $lt: thirtyDaysAgo } })
})
