import userModel, { type IUser } from '../models/user.model'
import { type NextFunction, type Response, type Request } from 'express'
import ErrorHandler from '../utils/errorHandler'
import { CatchAsyncError } from '../middleware/catchAsyncError'
import jwt, { type Secret } from 'jsonwebtoken'
import sendMail from '../utils/sendMail'
import { sendToken } from '../utils/jwt'
import { redis } from '../utils/redis'

require('dotenv').config()

// register user
interface IRegistrationBody {
  name: string
  email: string
  password: string
  avatar?: string
}

interface IActivationToken {
  token: string
  activationCode: string
}

export const registrationUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body
    const isEmailExist = await userModel.findOne({ email }) as boolean

    if (isEmailExist) {
      next(new ErrorHandler('Email already exist', 400)); return
    }

    const user: IRegistrationBody = {
      name,
      email,
      password
    }

    const activationToken = createActivationToken(user)
    const activationCode = activationToken.activationCode
    const data = { user: { name: user.name }, activationCode }
    console.log(user)
    try {
      await sendMail({
        email: user.email,
        subject: 'Activate your account',
        template: 'activation-mail.ejs',
        data
      })

      res.status(201).json({
        success: true,
        message: `Please check your email: ${user.email} to activate your account!`,
        activationToken: activationToken.token
      })
    } catch (error: any) {
      next(new ErrorHandler(error.message, 400))
    }
  } catch (error: any) {
    next(new ErrorHandler(error.message, 400))
  }
})

export const createActivationToken = (user: IRegistrationBody): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString()

  const token = jwt.sign({
    user,
    activationCode
  },
  process.env.ACTIVATION_SECRET as Secret,
  {
    expiresIn: '5m'
  })

  return { token, activationCode }
}

// activate user
interface IActivationRequest {
  activationToken: string
  activationCode: string
}

export const activateUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { activationToken, activationCode } = req.body as IActivationRequest

    const newUser: { user: IUser, activationCode: string } = jwt.verify(
      activationToken,
      process.env.ACTIVATION_SECRET
    ) as { user: IUser, activationCode: string }

    if (newUser.activationCode !== activationCode) {
      next(new ErrorHandler('Invalid activation code', 400))
    }

    const { name, email, password } = newUser.user

    const existUser = await userModel.findOne({ email }) as boolean

    if (existUser) {
      next(new ErrorHandler('Email already exist', 400))
    }

    await userModel.create({
      name,
      email,
      password
    })

    res.status(201).json({
      success: true
    })
  } catch (error) {
    next(new ErrorHandler(error.message, 400))
  }
})

// Login user
interface ILoginRequest {
  email: string
  password: string
}

export const loginUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as ILoginRequest

    if ((email === '') || (password === '')) {
      next(new ErrorHandler('Please enter email and password', 400))
    }

    const user = await userModel.findOne({ email }).select('+password') as IUser

    if (user === null) {
      next(new ErrorHandler('Invalid email or password', 400)); return
    }

    const isPasswordMatch = await user.comparePassword(password)

    if (!isPasswordMatch) {
      next(new ErrorHandler('Invalid email or password', 400))
    }

    await sendToken(user, 200, res)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 400))
  }
})

// logout user
export const logoutUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.cookie('access_token', '', { maxAge: 1 })
    res.cookie('refresh_token', '', { maxAge: 1 })

    await redis.del(req.user?._id || '')

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error: any) {
    next(new ErrorHandler(error.message, 400))
  }
})
