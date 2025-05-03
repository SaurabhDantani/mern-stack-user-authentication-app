import { Request, Response, NextFunction } from 'express';
import Jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { RoleEnum } from '../utils/roleEnum';
import { UserSession } from '../entities/userSession';
import dbUtils from '../utils/db.utils';

dotenv.config();
const secretKey: any = process.env.AUTH_SECRET_KEY;

interface AuthUser {
  id: number;
  role: RoleEnum;
  email: string;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication token is missing' });
    }

    const decoded = Jwt.verify(token, secretKey) as any;
    (req as any).user = {
      id: decoded.userId,
      role: decoded.role,
      email: decoded.email
    };

    next();
    return
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const authorizeRole = (allowedRoles: RoleEnum[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as AuthUser;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    next();
    return
  };
};

// Middleware to update last active timestamp
export const updateLastActive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user as AuthUser;
    if (user) {
      const connection = await dbUtils.getDefaultConnection();
      const sessionRepo = connection.getRepository(UserSession);

      // Update last active timestamp for the current session
      await sessionRepo.update(
        { 
          user: { id: user.id },
          isActive: true,
          jwtToken: req.cookies.jwt || req.headers.authorization?.split(' ')[1]
        },
        { lastActiveAt: new Date() }
      );
    }
    next();
  } catch (error) {
    console.error('Error updating last active:', error);
    next();
  }
}; 