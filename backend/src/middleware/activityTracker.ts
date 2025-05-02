import { Request, Response, NextFunction } from 'express';
import dbUtils from '../utils/db.utils';
import { UserSession } from '../entities/userSession';
import Jwt from 'jsonwebtoken';

export const trackActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return next();
    }

    const decoded = Jwt.verify(token, process.env.AUTH_SECRET_KEY || 'default_secret_key') as any;
    if (!decoded?.member?.id) {
      return next();
    }

    const connection = await dbUtils.getDefaultConnection();
    const sessionRepo = connection.getRepository(UserSession);

    // Update last active time for the session
    await sessionRepo.update(
      { 
        user: { id: decoded.member.id },
        jwtToken: token,
        isActive: true 
      },
      { lastActiveAt: new Date() }
    );

    next();
  } catch (error) {
    next();
  }
}; 