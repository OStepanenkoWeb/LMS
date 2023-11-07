import mongoose, { type Document, type Model, Schema } from 'mongoose'

export interface IOrder extends Document {
  courseId: string
  userId: string
  paymentInfo?: object
}

const orderSchema = new Schema<IOrder>({
  course: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  paymentInfo: {
    type: Object
  }
}, { timestamps: true })

const OrderModel: Model<IOrder> = mongoose.model('Order', orderSchema)

export default OrderModel
