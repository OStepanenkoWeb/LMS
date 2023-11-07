import { type NextFunction, type Request, type Response } from 'express'
import { CatchAsyncError } from '../middleware/catchAsyncError'
import ErrorHandler from '../utils/errorHandler'
import { createOrderService, getAllOrdersService } from '../services/order.service'

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
