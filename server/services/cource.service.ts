import { type Response, type Request, type NextFunction } from 'express'
import { CatchAsyncError } from '../middleware/catchAsyncError'
import CourseModel, { type IComment, ICourceData, type ICourse } from '../models/course.model'
import { redis } from '../utils/redis'
import ErrorHandler from '../utils/errorHandler'
import mongoose from 'mongoose'
import path from 'path'
import ejs from 'ejs'
import sendMail from '../utils/sendMail'

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

// get course content by user
export const getCourseByUserId = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const userCourseList = req.user?.courses
  const courseId = req.params.id

  if (userCourseList) {
    const courseExists = userCourseList.find((course: any): boolean => {
      return course.courseId.equals(courseId)
    })

    if (!courseExists) {
      next(new ErrorHandler('You are not eligible to access this course', 400)); return
    }

    const course = await CourseModel.findById(courseId) as ICourse

    const content = course.courseData

    res.status(200).json({
      success: true,
      content
    })
  }
  next(new ErrorHandler('The user does not have a list of courses', 400))
})

// add questions in course
interface IAddQuestionData {
  question: string
  courseId: string
  contentId: string
}

export const addQuestionService = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const { question, courseId, contentId }: IAddQuestionData = req.body
  const course = await CourseModel.findById(courseId) as ICourse

  if (!mongoose.Types.ObjectId.isValid(contentId)) {
    next(new ErrorHandler('Invalid content id', 400))
  }

  const courseContent = course.courseData.find((item: any) => item._id.equals(contentId))

  if (!courseContent) {
    next(new ErrorHandler('Invalid course content', 400))
  }

  // create a new question object

  const newQuestion: any = {
    user: req.user,
    question,
    questionReplies: []
  }

  // add this question to course content

  courseContent.questions.push(newQuestion)

  // save the update course
  await course?.save()

  res.status(200).json({
    success: true,
    course
  })
})

// add answer in course question

interface IAddAnswerData {
  answer: string
  courseId: string
  contentId: string
  questionId: string
}

export const addAnswerQuestionService = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const { answer, courseId, contentId, questionId }: IAddAnswerData = req.body
  const course = await CourseModel.findById(courseId) as ICourse

  if (!mongoose.Types.ObjectId.isValid(contentId)) {
    next(new ErrorHandler('Invalid content id', 400))
  }

  const courseContent = course.courseData.find((item: any) => item._id.equals(contentId))

  if (!courseContent) {
    next(new ErrorHandler('Invalid content id', 400))
  }

  const question = courseContent?.questions?.find((item: any) => item._id.equals(questionId))

  if (!question) {
    next(new ErrorHandler('Invalid question id', 400))
  }

  // create a new answer object
  const newAnswer: any = {
    user: req.user,
    question: answer
  }

  // add this answer to our course content
  if (!question.questionReplies) {
    question.questionReplies = []
  }
  question.questionReplies?.push<IComment>(newAnswer)

  await course.save()

  if (req.user?._id === question.user?._id) {
    // create a notification

  } else {
    const data = {
      name: question.user.name,
      title: courseContent.title
    }

    try {
      await sendMail({
        email: question.user.email,
        subject: 'Question Reply',
        template: 'question-reply.ejs',
        data
      })
    } catch (error: any) {
      next(new ErrorHandler(error.message, 500)); return
    }
  }

  res.status(200).json({
    success: true,
    course
  })
})
