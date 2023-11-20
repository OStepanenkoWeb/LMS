import { type Response, type Request, type NextFunction } from 'express'
import CourseModel, { type IComment, type ICourse } from '../models/course.model'
import { redis } from '../utils/redis'
import ErrorHandler from '../utils/errorHandler'
import mongoose from 'mongoose'
import sendMail from '../utils/sendMail'
import NotificationModel from '../models/notification.model'
import courseModel from '../models/course.model'

// create course
export const createCourse = async (req: Request, res: Response): Promise<void> => {
  const data = req.body

  const course = await CourseModel.create(data)

  res.status(201).json({
    success: true,
    course
  })
}

// update course
export const updateCourse = async (req: Request, res: Response): Promise<void> => {
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
}

// get course by id
export const getCourseById = async (req: Request, res: Response): Promise<void> => {
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
}

// get all courses
export const getAllCoursesList = async (req: Request, res: Response): Promise<void> => {
  const isCacheExist = await redis.get('allCourses')

  let courses = null

  courses = await CourseModel
      .find()
      .select('-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links')

  res.status(200).json({
    success: true,
    courses
  })
}

// get course content by user
export const getCourseByUserId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
}

// add questions in course
interface IAddQuestionData {
  question: string
  courseId: string
  contentId: string
}

export const addQuestionService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

  courseContent?.questions.push(newQuestion)

  await NotificationModel.create({
    user: req.user?._id,
    title: 'New Question Received',
    message: `You have a new question in ${courseContent?.title}`
  })

  // save the update course
  await course?.save()

  res.status(200).json({
    success: true,
    course
  })
}

// add answer in course question

interface IAddAnswerData {
  answer: string
  courseId: string
  contentId: string
  questionId: string
}

export const addAnswerQuestionService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
  if (!question?.questionReplies) {
    if(question) {
      question.questionReplies = []
    }
  }
  question?.questionReplies?.push(newAnswer)

  await course.save()

  if (req.user?._id === question?.user?._id) {
    // create a notification
    await NotificationModel.create({
      user: req.user?._id,
      title: 'New Question Reply Received',
      message: `You have a new question reply in ${courseContent?.title}`
    })
  } else {
    const data = {
      name: question?.user?.name,
      title: courseContent?.title
    }

    try {
      await sendMail({
        email: question?.user?.email || '',
        subject: 'Question Reply',
        template: 'question-reply.ejs',
        data
      })
    } catch (error: any) {
      next(new ErrorHandler(error.message, 500))
      return
    }
  }

  res.status(200).json({
    success: true,
    course
  })
}

// add review in course
interface IAddReviewData {
  review: string
  courseId: string
  rating: number
  userId: string
}

export const addReviewCourseService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userCourseList = req.user?.courses
  const courseId = req.params.id

  // check if courseId already exist in userCourseList based on _id
  const courseExist = userCourseList?.some((course: any) => course._id.equals(courseId))

  if (!courseExist) {
    next(new ErrorHandler('You are not eligible to access this course', 500))
    return
  }
  const course = await CourseModel.findById(courseId) as ICourse

  const { review, rating } = req.body as IAddReviewData

  const reviewData: any = {
    user: req.user,
    rating,
    comment: review
  }

  course?.reviews.push(reviewData)

  let avg = 0

  course?.reviews.forEach((rev: any) => {
    avg += rev.rating
  })

  course.ratings = avg / course.reviews.length

  await course?.save()

  // create notification
  // const notification = {
  //   title: 'New Review Received',
  //   message: `${req.user?.name} has given a review in ${course?.name}`
  // }

  res.status(200).json({
    success: true,
    course
  })
}

// add reply in review
interface IAddReplyReviewData {
  comment: string
  courseId: string
  reviewId: string
}

export const addReplyToReviewService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { courseId, comment, reviewId } = req.body as IAddReplyReviewData

  const course = await CourseModel.findById(courseId) as ICourse

  if (!course) {
    next(new ErrorHandler('Course not found', 404))
    return
  }

  const review = course?.reviews?.find((rev: any) => rev._id.equals(reviewId))

  if (!review) {
    next(new ErrorHandler('Review not found', 404))
    return
  }

  const replyData: any = {
    user: req.user,
    comment
  }

  if (!review.commentReplies) {
    review.commentReplies = []
  }

  review.commentReplies.push(replyData)

  await course?.save()

  res.status(200).json({
    success: true,
    course
  })
}

// get all courses
export const getAllFullCoursesService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const courses = await courseModel.find().sort({ createdAt: -1 })

  res.status(210).json({
    success: true,
    courses
  })
}

// delete course

export const deleteCourseService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params

  const course = await courseModel.findById(id)

  if (!course) {
    next(new ErrorHandler('Course not found', 404))
    return
  }

  await course.deleteOne({ id })

  await redis.del(id)

  res.status(200).json({
    success: true,
    message: 'Course deleted successfully'
  })
}
