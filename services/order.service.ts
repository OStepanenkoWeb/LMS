import { type NextFunction, type Request, type Response } from 'express'
import CourseModel, { type ICourse } from '../models/course.model'
import OrderModel, { type IOrder } from '../models/order.model'
import userModel, { type IUser } from '../models/user.model'
import ErrorHandler from '../utils/errorHandler'
import sendMail from '../utils/sendMail'
import NotificationModel from '../models/notification.model'
import orderModel from '../models/order.model'
import {redis} from "../utils/redis";
require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

// create order
export const createOrderService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { courseId, paymentInfo } = req.body as IOrder

  if(paymentInfo){
    if('id' in paymentInfo){
      const paymentIntentsId = paymentInfo.id
      const paymentIntents = await stripe.paymentIntents.retrieve(
          paymentIntentsId
      )

      if(paymentIntents.status !== 'succeeded') {
        next(new ErrorHandler('Платеж не авторизован', 400))
      }
    }
  }

  const user = await userModel.findById(req.user?._id) as IUser

  const courseExistInUser = user?.courses.some((course: any) => course._id.equals(courseId))

  if (courseExistInUser) {
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
      id: course._id.toString().slice(0, 6),
      name: course.name,
      price: course.price,
      date: new Date().toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })
    }
  }
  console.log(mailData)
  console.log(user.email)
  try {
    if (user) {
      await sendMail({
        email: user.email,
        subject: 'Order Confirmation',
        template: 'order-confirmation.ejs',
        data: mailData
      })
    }
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
    return
  }

  user?.courses.push(course?._id)

  await redis.set(req.user?._id, JSON.stringify(user))

  await user?.save()

  await NotificationModel.create({
    user: user?._id,
    title: 'New Order',
    message: `You have a new order from ${course?.name}`
  })

  course.purchased = (course?.purchased ? course?.purchased : 0)  + 1

  await course.save()

  const order = await OrderModel.create(data)

  res.status(201).json({
    success: true,
    order
  })
}

// get all orders
export const getAllOrdersService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const orders = await orderModel.find().sort({ createdAt: -1 })

  res.status(200).json({
    success: true,
    orders
  })
}

// new payment
export const newPaymentService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const myPayment = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: 'USD',
    metadata: {
      company: 'LMS'
    },
    automatic_payment_methods: {
      enabled: true
    }
  })

  res.status(200).json({
    success: true,
    client_secret: myPayment.client_secret
  })
}

