import { CatchAsyncError } from '../middleware/catchAsyncError'
import { type NextFunction, type Request, type Response } from 'express'
import ErrorHandler from '../utils/errorHandler'
import { createLayoutService, editLayoutService, getLayoutByTypeService } from '../services/layout.service'

// create layout
export const createLayout = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createLayoutService(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})

// edit layout
export const editLayout = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await editLayoutService(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})

// get layout
export const getLayoutByType = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getLayoutByTypeService(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})
