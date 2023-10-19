import mongoose, { type Document, type Model, Schema } from 'mongoose'

interface IComment {
  user: object
  comment: string
  commentReplies?: IComment[]
}

interface IReview extends Document {
  user: object
  rating: number
  comment: string
  commentReplies: IComment[]
}

interface ILink extends Document {
  title: string
  url: string
}

interface ICourseData extends Document {
  title: string
  description: string
  videoUrl: string
  videoThumbnail: string
  videoSection: string
  videoLength: number
  videoPlayer: string
  links: ILink[]
  suggestion: string
  questions: IComment[]
}

export interface ICourse extends Document {
  name: string
  description?: string
  price: number
  estimatedPrice?: number
  thumbnail: string
  tags: string[]
  level: string
  demoUrl: string
  benefits: Array<{ title: string }>
  prerequisites: Array<{ title: string }>
  reviews: IReview[]
  courseData: ICourseData[]
  ratings?: number
  purchased?: number
}

const reviewSchema = new Schema<IReview>({
  user: String,
  rating: {
    type: Number,
    default: 0
  },
  comment: String
})

const linksSchema = new Schema<ILink>({
  title: String,
  url: String
})

const commentSchema = new Schema<IComment>({
  user: Object,
  comment: String,
  commentReplies: [Object]
})

const courseDataSchema = new Schema<ICourceData>({
  title: String,
  description: String,
  videoUrl: String,
  videoSection: String,
  videoLength: Number,
  videoPlayer: String,
  links: [linksSchema],
  suggestion: String,
  questions: [commentSchema]
})

const courseSchema = new Schema<ICourse>({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  estimatedPrice: Number,
  thumbnail: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    required: true
  },
  level: {
    type: String,
    required: true
  },
  demoUrl: {
    type: String,
    required: true
  },
  benefits: [{ title: String }],
  prerequisites: [{ title: String }],
  reviews: [reviewSchema],
  courseData: [courseDataSchema],
  ratings: {
    type: Number,
    default: 0
  },
  purchased: {
    type: Number,
    default: 0
  }
})

const CourseModel: Model<ICourse> = mongoose.model('Course', courseSchema)

export default CourseModel