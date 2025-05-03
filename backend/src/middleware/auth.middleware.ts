import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { RoleEnum } from '../utils/roleEnum';
import { UserSession } from '../entities/userSession';
import { dataSource } from '../db';
import dbUtils from '../utils/db.utils';
import { User } from '../entities/users';

dotenv.config();
const secretKey: any = process.env.AUTH_SECRET_KEY;

export interface AuthUser {
  id: number;
  role: RoleEnum;
  email: string;
}

const userSessionRepository = dataSource.getRepository(UserSession);

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, secretKey || 'your-secret-key') as any;
    
    // Check if session is active
    const session = await userSessionRepository.findOne({
      where: {
        jwtToken: token,
        isActive: true
      },
      relations: ['user']
    });

    if (!session) {
      return res.status(401).json({ message: 'Session expired or invalid' });
    }

    // Update last active time
    session.lastActiveAt = new Date();
    await userSessionRepository.save(session);

    req.user = session.user;
    next();
    return
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export const authorizeRole = (roles: RoleEnum[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as AuthUser;
    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
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
          jwtToken: req.headers['authorization']?.split(' ')[1]
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