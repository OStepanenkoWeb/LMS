import mongoose, {type Document, type Model, type Schema, ValidateOpts} from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

require('dotenv').config()

const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface IUser extends Document {
  email: string
  name: string
  password: string
  avatar?: string
  role: string
  isVerified: boolean
  courses: Array<{ courseId: string }>
  comparePassword: (password: string) => Promise<boolean>
  signAccessToken: () => string
  signRefreshToken: () => string
}

const userSchema: Schema<IUser> = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Please enter your name']
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    validate: {
      validator: function (value: string) {
        return Boolean(emailRegexPattern.test(value))
      },
      message: 'please enter a valid email',
      unique: true
    } as ValidateOpts<any>
  },
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: String,
  role: {
    type: String,
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  courses: [
    {
      courseId: String
    }
  ]
}, { timestamps: true })

// Hash Password before saving
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

// Sign access token
userSchema.methods.signAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN ?? '', {
    expiresIn: '5m'
  })
}

// Sign refresh token
userSchema.methods.signRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN ?? '', {
    expiresIn: '3d'
  })
}

// compare password
userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password)
}

const userModel: Model<IUser> = mongoose.model('User', userSchema)

export default userModel
