import { type NextFunction, type Response, type Request } from 'express'
import { CatchAsyncError } from '../middleware/catchAsyncError'
import CourseModel from '../models/course.model'

// create course
export const createCourse = CatchAsyncError(async (req: Request, res: Response) => {
  const data = req.body

  const course = await CourseModel.create(data)

  res.status(201).json({
    success: true,
    course
  })
})

// update course
export const updateCourse = CatchAsyncError(async (req: Request, res: Response) => {
  const data = req.body

  const courseId = req.params.id

  const course = await CourseModel.findByIdAndUpdate(courseId,
    { $set: data },
    { new: true }
  )

  res.status(201).json({
    success: true,
    course
  })
})
