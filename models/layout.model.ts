import mongoose, { type Document, type Model, Schema } from 'mongoose'

export interface IFaqItem extends Document {
  question: string
  answer: string
}

export interface ICategory extends Document {
  title: string
}

export interface IBanner {
  image: string
  title: string
  subTitle: string
}

export interface ILayout extends Document {
  type: string
  faq: IFaqItem[]
  categories: ICategory[]
  banner: IBanner
}

const faqSchema = new Schema<IFaqItem>({
  question: { type: String },
  answer: { type: String }
})

const categorySchema = new Schema<ICategory>({
  title: { type: String }
})

const layoutSchema = new Schema<ILayout>({
  type: { type: String },
  faq: [faqSchema],
  categories: [categorySchema],
  banner: {
    image: { type: String },
    title: { type: String },
    subTitle: { type: String }
  }
})

const LayoutModel: Model<ILayout> = mongoose.model('Layout', layoutSchema)

export default LayoutModel
