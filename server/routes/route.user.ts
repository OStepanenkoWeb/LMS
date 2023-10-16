import express from 'express'
import { activateUser, loginUser, logoutUser, registrationUser, updateAccessToken } from '../controllers/user.controller'

const userRouter = express.Router()

userRouter.post('/registration', registrationUser)

userRouter.post('/activate-user', activateUser)

userRouter.post('/login', loginUser)

userRouter.get('/logout', logoutUser)

userRouter.get('/refresh-token', updateAccessToken)

export default userRouter
