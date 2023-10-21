import express from 'express'
import {
  addAnswerQuestion,
  addQuestion, addReplyToReview, addReviewCourse,
  editCourse,
  getAllCourses,
  getCourseByUser,
  getSingleCourse,
  uploadCourse
} from '../controllers/cource.controller'
import { authorizeRoles, isAuthenticated } from '../middleware/auth'

const courseRouter = express.Router()

courseRouter.post('/create-course', isAuthenticated, authorizeRoles('admin'), uploadCourse)

courseRouter.put('/edit-course/:id', isAuthenticated, authorizeRoles('admin'), editCourse)

courseRouter.get('/get-course/:id', getSingleCourse)

courseRouter.get('/get-courses', getAllCourses)

courseRouter.get('/get-course-content/:id', isAuthenticated, getCourseByUser)

courseRouter.put('/add-question', isAuthenticated, addQuestion)

courseRouter.put('/add-answer', isAuthenticated, addAnswerQuestion)

courseRouter.put('/add-review/:id', isAuthenticated, addReviewCourse)

courseRouter.put('/add-reply', isAuthenticated, authorizeRoles('admin'), addReplyToReview)

export default courseRouter
