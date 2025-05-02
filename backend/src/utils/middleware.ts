import { Request, Response, NextFunction } from "express";
import passport from "passport";
const secretKey:any = process.env.AUTH_SECRET_KEY;
import * as dotenv from 'dotenv';
import Jwt from 'jsonwebtoken';

const isCookieAuthenticated = (req: any, res: any, next: NextFunction) => {
    const token = req.header.authorization?.split(' ')[1];
    if (!token) {
        // return res.redirect('/')
        return res.status(401).json({ message: "Authentication token is missing" });
    }

    Jwt.verify(token, secretKey, (err: any, decoded: any) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token" });
        }

        req.user = decoded;
        next();
    });
};

const hasRole = (roles: number[]) => {
    return (req: any, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.roleType)) {
            return res.json({ message: "Forbidden: insufficient role" });
        }
       return next();
    };
};

export default { isCookieAuthenticated, hasRole };