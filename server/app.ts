import userRouter from './routes/route.user'
import courseRouter from './routes/course.route'
import express, { type NextFunction, type Request, type Response } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { ErrorMiddleware } from './middleware/error'

require('dotenv').config()
export const app = express()

// body parser

app.use(express.json({ limit: '50mb' }))
// cookie parser

app.use(cookieParser())

// cors
app.use(cors({
  origin: process.env.ORIGIN
}))

// routes

app.use('/api/v1', userRouter)

app.use('/api/v1', courseRouter)

// testing api

app.get('/test', (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: 'API is ready'
  })
})
// unknown route

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any
  err.statusCode = 404

  next(err)
})

app.use(ErrorMiddleware)
