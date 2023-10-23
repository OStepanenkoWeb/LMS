import { CatchAsyncError } from '../middleware/catchAsyncError'
import { type NextFunction, type Request, type Response } from 'express'
import CourseModel, { type ICourse } from '../models/course.model'
import OrderModel, { type IOrder } from '../models/order.model'
import userModel, { type IUser } from '../models/user.model'
import ErrorHandler from '../utils/errorHandler'
import path from 'path'
import sendMail from '../utils/sendMail'
import NotificationModel from '../models/notification.model'

// create order
export const createOrderService = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const { courseId, paymentInfo } = req.body as IOrder

  const user = await userModel.findById(req.user?._id) as IUser

  const courseExistInUser = user?.courses.some((course: any) => course._id.equals(courseId))

  if (!courseExistInUser) {
    next(new ErrorHandler('You have already purchased this course', 400))
    return
  }

  const course = await CourseModel.findById(courseId) as ICourse

  if (!course) {
    next(new ErrorHandler('Course not found', 400))
    return
  }

  const data: any = {
    courseId: course._id,
    userId: user?._id,
    paymentInfo
  }

  const mailData = {
    order: {
      _id: course._id.toString().slice(0, 6),
      name: course.name,
      price: course.price,
      date: new Date().toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })
    }
  }

  try {
    if (user) {
      await sendMail({
        email: user.email,
        subject: 'Question Reply',
        template: 'order-confirmation.ejs',
        data: mailData
      })
    }
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
    return
  }

  user?.courses.push(course?._id)

  await user?.save()

  await NotificationModel.create({
    user: user?._id,
    title: 'New Order',
    message: `You have a new order from ${course?.name}`
  })

  course.purchased = course.purchased ? course.purchased += 1 : course.purchased

  await course.save()

  const order = await OrderModel.create(data)

  res.status(201).json({
    success: true,
    order
  })
})
