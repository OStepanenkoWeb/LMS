import mongoose from 'mongoose'
require('dotenv').config()

const dbUrl: string = process.env.DB_URL ?? ''

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(dbUrl).then((data: any) => {
      console.log(`Database connected with ${data.connection.host}`)
    })
  } catch (error: any) {
    console.log('Database error connecting', error.message)
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setTimeout(connectDB, 5000)
  }
}

export default connectDB
