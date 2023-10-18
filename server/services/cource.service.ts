import { type Response, type Request } from 'express'
import { CatchAsyncError } from '../middleware/catchAsyncError'
import CourseModel from '../models/course.model'
import { redis } from '../utils/redis'

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

// get course by id
export const getCourseById = CatchAsyncError(async (req: Request, res: Response) => {
  const courseId = req.params.id

  const isCacheExist = await redis.get(courseId)

  let course = null

  if (isCacheExist) {
    course = JSON.parse(isCacheExist)
  } else {
    course = await CourseModel
      .findById(req.params.id)
      .select('-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links')

    await redis.set(courseId, JSON.stringify(course))
  }

  res.status(200).json({
    success: true,
    course
  })
})

// get all courses
export const getAllCoursesList = CatchAsyncError(async (req: Request, res: Response) => {
  const isCacheExist = await redis.get('allCourses')

  let courses = null

  if (isCacheExist) {
    courses = JSON.parse(isCacheExist)
  } else {
    courses = await CourseModel
      .find()
      .select('-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links')

    await redis.set('allCourses', JSON.stringify(courses))
  }

  res.status(200).json({
    success: true,
    courses
  })
})
