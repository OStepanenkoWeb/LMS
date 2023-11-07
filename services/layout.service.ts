import { type NextFunction, type Request, type Response } from 'express'
import LayoutModel, { type IBanner, type ICategory, type IFaqItem, type ILayout } from '../models/layout.model'
import ErrorHandler from '../utils/errorHandler'
import { CatchAsyncError } from '../middleware/catchAsyncError'

// create layout
export const createLayoutService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { type } = req.body

  if (type === 'Banner') {
    const { title, subTitle, image } = req.body as IBanner
    const isTypeExist = await LayoutModel.findOne({ type })

    if (isTypeExist) {
      next(new ErrorHandler(`${type} already exist`, 400))
      return
    }

    const banner = {
      type: 'Banner',
      image: { url: image },
      title,
      subTitle
    }

    await LayoutModel.create(banner)
  }

  if (type === 'FAQ') {
    const { faq } = req.body

    const faqItems = await Promise.all(
      faq.map(async (item: IFaqItem) => {
        return {
          question: item.question,
          answer: item.answer
        }
      })
    )

    await LayoutModel.create({ type: 'FAQ', faq: faqItems })
  }

  if (type === 'Categories') {
    const { categories } = req.body

    const categoriesItems = await Promise.all(
      categories.map(async (item: ICategory) => {
        return {
          title: item.title
        }
      })
    )

    await LayoutModel.create({ type: 'Categories', categories: categoriesItems })
  }
  res.status(200).json({
    success: true,
    message: 'Layout created successfully'
  })
}

// edit layout
export const editLayoutService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { type } = req.body

  if (type === 'Banner') {
    const bannerData = await LayoutModel.findOne({ type: 'Banner' }) as ILayout
    const { title, subTitle, image } = req.body as IBanner

    const banner = {
      type: 'Banner',
      image: { url: image },
      title,
      subTitle
    }

    await LayoutModel.findByIdAndUpdate(bannerData?._id, { banner })
  }

  if (type === 'FAQ') {
    const { faq } = req.body
    const faqItem = await LayoutModel.findOne({ type: 'FAQ' }) as ILayout

    const faqItems = await Promise.all(
      faq.map(async (item: IFaqItem) => {
        return {
          question: item.question,
          answer: item.answer
        }
      })
    )

    await LayoutModel.findByIdAndUpdate(faqItem?._id, { type: 'FAQ', faq: faqItems })
  }

  if (type === 'Categories') {
    const { categories } = req.body

    const categoriesData = await LayoutModel.findOne({ type: 'FAQ' }) as ILayout

    const categoriesItems = await Promise.all(
      categories.map(async (item: ICategory) => {
        return {
          title: item.title
        }
      })
    )

    await LayoutModel.findByIdAndUpdate(categoriesData?._id, { type: 'Categories', categories: categoriesItems })
  }
  res.status(201).json({
    success: true,
    message: 'Layout updated successfully'
  })
}

// get layout

export const getLayoutByTypeService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { type } = req.body
  const layout = await LayoutModel.findOne(type)

  res.status(201).json({
    success: true,
    layout
  })
}
