import { Request, Response, NextFunction } from 'express';
import dbUtils from "../utils/db.utils";
import { User } from '../entities/users';
import { UserSession } from '../entities/userSession';
import * as dotenv from 'dotenv';
import { AuthUser } from 'src/middleware/auth.middleware';
import { use } from 'passport';
dotenv.config();
class AuthController {

  async getSessionActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const connection = await dbUtils.getDefaultConnection();
      const sessionRepo = connection.getRepository(UserSession);

      // Get user ID from authenticated request (assuming middleware sets this)
      const user = (req as any).user as AuthUser;
      if (!user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Get active sessions for the user
      const activeSessions = await sessionRepo.find({
        where: {
          user: { id: user.id },
          isActive: true
        },
        order: {
          lastActiveAt: 'DESC'
        }
      });

      // Format session data
      const sessions = activeSessions.map(session => ({
        id: session.id,
        device: session.userAgent,
        ipAddress: session.ipAddress,
        loginTime: session.createdAt,
        lastActive: session.lastActiveAt,
        isActive: session.isActive
      }));

      return res.status(200).json({ sessions });
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async doLogout(req: Request, res: Response, next: NextFunction) {
    try {
      const connection = await dbUtils.getDefaultConnection();
      const sessionRepo = connection.getRepository(UserSession);

      // Get current session token
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      const user = (req as any).user as AuthUser;

      // Invalidate current session
      await sessionRepo.update(
        { 
          user: { id: user.id },
          jwtToken: token,
          isActive: true
        },
        { isActive: false }
      );
      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const connection = await dbUtils.getDefaultConnection();
      const userRepo = connection.getRepository(User);

      // Get all users (excluding passwords)
      const users = await userRepo.find({
        select: ['id', 'name', 'email', 'role']
      });

      return res.status(200).json({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const connection = await dbUtils.getDefaultConnection();
      const userRepo = connection.getRepository(User);
      const user = (req as any).user as AuthUser;
      if (!user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      // Get all users (excluding passwords)
      const users = await userRepo.find({where:{
        id:user.id,      
      },
      select: ['id', 'name', 'email', 'role']
    });

      return res.status(200).json({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default new AuthController();
