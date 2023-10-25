import UserModel, { type IUser } from '../models/user.model'
import { type NextFunction, type Request, type Response } from 'express'
import { generateLast12MonthsData } from '../utils/analytics.generator'
import CourseModel, { type ICourse } from '../models/course.model'
import OrderModel, { type IOrder } from '../models/order.model'

// get users analytics --- only for admin
export const getUserAnalyticsService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const users = await generateLast12MonthsData<IUser>(UserModel)

  res.status(210).json({
    success: true,
    users
  })
}

// get courses analytics --- only for admin
export const getCoursesAnalyticsService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const courses = await generateLast12MonthsData<ICourse>(CourseModel)

  res.status(210).json({
    success: true,
    courses
  })
}

// get orders analytics --- only for admin
export const getOrdersAnalyticsService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const orders = await generateLast12MonthsData<IOrder>(OrderModel)

  res.status(210).json({
    success: true,
    orders
  })
}
