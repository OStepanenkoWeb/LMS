import express from 'express'
import {
  addAnswerQuestion,
  addQuestion, addReplyToReview, addReviewCourse, deleteCourse,
  editCourse,
  getAllCourses, getAllFullCourses,
  getCourseByUser,
  getSingleCourse,
  uploadCourse
} from '../controllers/cource.controller'
import { authorizeRoles, isAuthenticated } from '../middleware/auth'
import {updateAccessToken} from "../controllers/user.controller";

const courseRouter = express.Router()

courseRouter.post('/create-course', updateAccessToken, isAuthenticated, authorizeRoles('admin'), uploadCourse)

courseRouter.put('/edit-course/:id', updateAccessToken, isAuthenticated, authorizeRoles('admin'), editCourse)

courseRouter.get('/get-course/:id', getSingleCourse)

courseRouter.get('/get-courses', getAllCourses)

courseRouter.get('/get-course-content/:id', updateAccessToken, isAuthenticated, getCourseByUser)

courseRouter.put('/add-question', updateAccessToken, isAuthenticated, addQuestion)

courseRouter.put('/add-answer', updateAccessToken, isAuthenticated, addAnswerQuestion)

courseRouter.put('/add-review/:id', updateAccessToken, isAuthenticated, addReviewCourse)

courseRouter.put('/add-reply', updateAccessToken, isAuthenticated, authorizeRoles('admin'), addReplyToReview)

courseRouter.get('/get-full-courses', updateAccessToken, isAuthenticated, authorizeRoles('admin'), getAllFullCourses)

courseRouter.delete('/delete-course/:id', updateAccessToken, isAuthenticated, authorizeRoles('admin'), deleteCourse)

export default courseRouter
