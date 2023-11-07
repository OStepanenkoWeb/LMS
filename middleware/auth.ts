import { CatchAsyncError } from './catchAsyncError'
import { type Request, type Response, type NextFunction } from 'express'
import ErrorHandler from '../utils/errorHandler'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { redis } from '../utils/redis'

require('dotenv').config()

// authenticated user
export const isAuthenticated = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies.access_token

  if (!accessToken) {
    next(new ErrorHandler('Please login to access this resource', 401))
    return
  }

  const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN as string) as JwtPayload

  if (!decoded) {
    next(new ErrorHandler('Access token is not valid', 400))
    return
  }

  const user = await redis.get(decoded.id)

  if (!user) {
    next(new ErrorHandler('User not found', 400))
    return
  }

  req.user = JSON.parse(user)

  next()
})

// validate user role
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role ?? '')) {
      next(new ErrorHandler(`Role ${req.user?.role} is not allowed to access this resource`, 403))

      return
    }
    next()
  }
}
