import { type NextFunction, type Request, type Response } from 'express'
import { CatchAsyncError } from '../middleware/catchAsyncError'
import ErrorHandler from '../utils/errorHandler'
import {createOrderService, getAllOrdersService, newPaymentService} from '../services/order.service'

// create order
export const createOrder = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createOrderService(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})

// get all orders
export const getAllOrders = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getAllOrdersService(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})

// send stripe publish key
export const sentStripePublish = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
 res.status(200).json({
   publishablekey: process.env.STRIPE_PUBLISHABLE_KEY
 })
})

// new payment
export const newPayment = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await newPaymentService(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})
