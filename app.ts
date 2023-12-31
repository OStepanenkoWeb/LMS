import userRouter from './routes/user.route'
import courseRouter from './routes/course.route'
import orderRouter from './routes/order.route'
import express, { type NextFunction, type Request, type Response } from 'express'
import {cors} from './middleware/cors'
import cookieParser from 'cookie-parser'
import { ErrorMiddleware } from './middleware/error'
import notificationRouter from './routes/notification.route'
import analyticsRouter from './routes/analytics.route'
import layoutRouter from './routes/layout.route'
import path from 'path'

require('dotenv').config()
export const app = express()

// body parser

app.use(express.json({ limit: '50mb' }))

// cookie parser
app.use(cookieParser())

// cors

app.use(cors({
  origin: process.env.ORIGIN || '',
  credentials: true
}))
app.use(express.static(path.join(__dirname, '/public')))

// routes

app.use('/api/v1', userRouter, courseRouter, orderRouter, notificationRouter, analyticsRouter, layoutRouter)

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
