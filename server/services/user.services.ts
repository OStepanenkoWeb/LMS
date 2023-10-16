// get user by id
import { type Response } from 'express'
import { redis } from '../utils/redis'

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
