// get user by id
import { type NextFunction, type Request, type Response } from 'express'
import { redis } from '../utils/redis'
import userModel, {IUser} from '../models/user.model'
import ErrorHandler from '../utils/errorHandler'

export const getUserById = async (id: string, res: Response): Promise<void> => {
  const userJson = await redis.get(id)

  if (userJson) {
    const user = JSON.parse(userJson)

    res.status(210).json({
      success: true,
      user
    })
  }
}

// get all users
export const getAllUsersService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const users = await userModel.find().sort({ createdAt: -1 })

  res.status(210).json({
    success: true,
    users
  })
}

// update user role
export const updateUserRoleService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, role } = req.body
  const user = await userModel.findOne({ email }) as IUser

  const updatedUser = await userModel.findByIdAndUpdate(user._id, { role }, { new: true })

  await redis.set(user._id, JSON.stringify(updatedUser))

  res.status(210).json({
    success: true,
    user: updatedUser
  })
}

// delete user
export const deleteUserService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params

  const user = await userModel.findById(id)

  if (!user) {
    next(new ErrorHandler('User not found', 404))
    return
  }

  await user.deleteOne({ id })

  await redis.del(id)

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  })
}
