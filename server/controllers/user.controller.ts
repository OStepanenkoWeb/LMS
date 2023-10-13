require('dotenv').config()

import userModel from "../models/user.model";
import { NextFunction, Response, Request } from "express";
import ErrorHandler from "../utils/errorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import jwt, {Secret} from "jsonwebtoken"
import sendMail from "../utils/sendMail";

// register user
interface IRegistrationBody {
    name:string
    email:string
    password:string
    avatar?:string
}

interface IActivationToken{
    token: string
    activationCode: string
}

export const registrationUser = CatchAsyncError(async(req:Request, res: Response, next:NextFunction)=>{
    try {
        const { name, email, password } = req.body
        const isEmailExist = await userModel.findOne({ email })

        if(isEmailExist){
            return next(new ErrorHandler("Email already exist", 400))
        }

        const user:IRegistrationBody = {
            name,
            email,
            password
        }

        const activationToken = createActivationToken(user)
        const activationCode = activationToken.activationCode
        const data = { user: { name: user.name }, activationCode }
console.log(user)
        try {
            await sendMail({
                email: user.email,
                subject: "Activate your account",
                template: "activation-mail.ejs",
                data
            })

            res.status(201).json({
                success: true,
                message: `Please check your email: ${user.email} to activate your account!`,
                activationToken: activationToken.token
            })

        } catch (error:any) {
            return next(new ErrorHandler(error.message, 400))
        }

    }catch (error:any) {
        return next(new ErrorHandler(error.message, 400))
    }
} )

export const createActivationToken = (user:IRegistrationBody): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString()

    const token = jwt.sign({
        user,
        activationCode
    },
        process.env.ACTIVATION_SECRET as Secret,
        {
            expiresIn: "5m"
        })

    return { token, activationCode }
}