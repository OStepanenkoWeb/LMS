import express from 'express'
import { authorizeRoles, isAuthenticated } from '../middleware/auth'
import { createOrder, getAllOrders } from '../controllers/order.controller'
import {updateAccessToken} from "../controllers/user.controller";

const orderRouter = express.Router()

orderRouter.get('/create-order', updateAccessToken, isAuthenticated, createOrder)

orderRouter.get('/get-orders', updateAccessToken, isAuthenticated, authorizeRoles('admin'), getAllOrders)

export default orderRouter