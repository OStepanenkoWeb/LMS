import { NextFunction, Request, Response } from 'express';

interface IOptions {
    origin: string
    credentials: boolean
}

export const cors = ( options:IOptions ) =>
        (req: Request, res: Response, next: NextFunction): void => {
            // res.set('Access-Control-Allow-Headers', '*');
            res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
            res.set(
                'Access-Control-Allow-Methods',
                'PUT, POST, GET, DELETE, PATCH, OPTIONS'
            );
            res.set('Access-Control-Allow-Origin', options.origin);
            res.set('Access-Control-Allow-Credentials', options.credentials.toString());
            next();
        };