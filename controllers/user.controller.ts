import userModel, { type IUser } from '../models/user.model'
import { type NextFunction, type Response, type Request } from 'express'
import ErrorHandler from '../utils/errorHandler'
import { CatchAsyncError } from '../middleware/catchAsyncError'
import jwt, { type JwtPayload, type Secret } from 'jsonwebtoken'
import sendMail from '../utils/sendMail'
import { accessTokenOptions, refreshTokenOptions, sendToken } from '../utils/jwt'

import { redis } from '../utils/redis'
import {
  deleteUserService,
  getAllUsersService,
  getUserById,
  updateUserRoleService
} from '../services/user.services'
import * as process from 'process'

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
      process.env.ACTIVATION_SECRET || ''
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
  } catch (error: any) {
    next(new ErrorHandler(error?.message, 400))
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

// update access token
export const updateAccessToken = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refresh_token as string
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN as string) as JwtPayload

    const message = 'Could not refresh token'

    if (!decoded) {
      next(new ErrorHandler(message, 400))
    }
    const session = await redis.get(decoded.id as string)

    if (!session) {
      next(new ErrorHandler('Please login for access this resources', 400))
    }

    const user = JSON.parse( session || '')

    const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN as string, {
      expiresIn: '5m'
    })

    const newRefreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN as string, {
      expiresIn: '3d'
    })

    req.user = user

    res.cookie('access_token', accessToken, accessTokenOptions)
    res.cookie('refresh_token', newRefreshToken, refreshTokenOptions)

    await redis.set(user._id, JSON.stringify(user), 'EX', 604800) // 7 days

    res.status(200).json({
      status: 'success',
      accessToken
    })
  } catch (error: any) {
    next(new ErrorHandler(error.message, 400))
  }
})

// get user info
export const getUserInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id

    await getUserById(userId, res)
  } catch (error: any) {
    next(new ErrorHandler(error?.message, 400))
  }
})

// social auth
export const socialAuth = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name, avatar } = req.body
    const password: string = 'testpsw' // TODO implement password generation for those registered via a social network

    const user = await userModel.findOne({ email }) as IUser

    if (!user) {
      const newUser = await userModel.create({ email, name, password, avatar }) as IUser

      await sendToken(newUser, 200, res)
    } else {
      await sendToken(user, 200, res)
    }
  } catch (error: any) {
    next(new ErrorHandler(error?.message, 400))
  }
})

// update user info
interface IUpdateUserInfo {
  email: string
  name: string
}

export const updateUserInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body as IUpdateUserInfo
    const userId = req.user?._id
    const user = await userModel.findById(userId) as IUser

    if (name && user) {
      user.name = name
    }

    await user?.save()

    await redis.set(userId, JSON.stringify(user))

    res.status(201).json({
      success: true,
      user
    })
  } catch (error: any) {
    next(new ErrorHandler(error?.message, 400))
  }
})

// update user password
interface IUpdateUserPassword {
  oldPassword: string
  newPassword: string
}

export const updatePassword = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { oldPassword, newPassword } = req.body as IUpdateUserPassword

    if (!oldPassword || !newPassword) {
      next(new ErrorHandler('Пожалуйста введите свои старый и новый пароли', 400))

      return
    }

    const user = await userModel.findById(req.user?._id).select('+password') as IUser

    if (!user.password) {
      next(new ErrorHandler('Invalid user', 400))

      return
    }

    const isPasswordMatch = await user?.comparePassword(oldPassword)

    if (!isPasswordMatch) {
      next(new ErrorHandler('Старый пароль введен не правильно', 400))

      return
    }

    user.password = newPassword

    await user.save()

    await redis.set(req.user?._id, JSON.stringify(user))

    res.status(201).json({
      success: true,
      user
    })
  } catch (error: any) {
    next(new ErrorHandler(error?.message, 400))
  }
})

// update profile picture
export const updateProfilePicture = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filename } = req?.file as any

    const userId = req.user?._id
    const user = await userModel.findById(userId) as IUser

    if (filename && user) {
      user.avatar = filename
    }

    await user.save()

    await redis.set(userId, JSON.stringify(user))

    res.status(201).json({
      success: true,
      user
    })
  } catch (error: any) {
    next(new ErrorHandler(error?.message, 400))
  }
})

// get all users
export const getAllUsers = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getAllUsersService(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})

// update user role
export const updateUserRole = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updateUserRoleService(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})

// delete user
export const deleteUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteUserService(req, res, next)
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500))
  }
})
