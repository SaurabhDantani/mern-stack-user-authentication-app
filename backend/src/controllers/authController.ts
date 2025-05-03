import { Request, Response, NextFunction } from 'express';
import dbUtils from "../utils/db.utils";
import { RoleEnum } from '../utils/roleEnum';
import * as bcrypt from 'bcrypt';
import Jwt from 'jsonwebtoken';
import { User } from '../entities/users';
import { UserSession } from '../entities/userSession';
import * as dotenv from 'dotenv';
dotenv.config();
const secretKey: any = process.env.AUTH_SECRET_KEY;

class AuthController {
  async doRegistration(req: Request, res: Response, next: NextFunction) {
    const { email, name, password, role } = req.body;
    let currentRole: any = role === 1 ? RoleEnum.Admin : RoleEnum.User;

    try {
      const connection = await dbUtils.getDefaultConnection();
      const memberRepo = connection.getRepository(User)

      const userExists = await memberRepo
        .createQueryBuilder('user')
        .where('user.Email = :Email', { Email: email })
        .getOne();

      if (userExists) {
        return res.status(409).json({ message: 'Email Id exists' });
      }

      const member = memberRepo.create({
        name: name,
        email: email,
        password: password,
        role: currentRole,
      });

      await memberRepo.save(member);
      return res.status(200).json('User registered successfully');
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'error', error });
    }
  }

  async doLogin(req: Request, res: Response, next: NextFunction) {
    const ip = Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : req.headers['x-forwarded-for'] || req.socket.remoteAddress || "";
    const userAgent = req.get('User-Agent') || "";
    const { email, password } = req.body;

    try {
      const connection = await dbUtils.getDefaultConnection();
      const userRepo = connection.getRepository(User);
      const sessionRepo = connection.getRepository(UserSession);

      // Find user by email
      const user = await userRepo.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Invalidate previous active sessions
      await sessionRepo.update(
        { user: { id: user.id }, isActive: true },
        { isActive: false }
      );

      // Generate JWT token
      const token = Jwt.sign(
        { 
          userId: user.id,
          role: user.role,
          email: user.email 
        },
        secretKey,
        { expiresIn: '1h' }
      );

      // Create new session
      const session = sessionRepo.create({
        user,
        jwtToken: token,
        ipAddress: ip,
        userAgent,
        isActive: true,
        lastActiveAt: new Date()
      });

      await sessionRepo.save(session);

      // Set JWT in HTTP-only cookie
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000 // 1 hour
      });

      return res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getSessionActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const connection = await dbUtils.getDefaultConnection();
      const sessionRepo = connection.getRepository(UserSession);

      // Get user ID from authenticated request (assuming middleware sets this)
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Get active sessions for the user
      const activeSessions = await sessionRepo.find({
        where: {
          user: { id: userId },
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
      const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];

      // Invalidate current session
      await sessionRepo.update(
        { 
          user: { id: (req as any).user.userId },
          jwtToken: token,
          isActive: true
        },
        { isActive: false }
      );

      // Clear JWT cookie
      res.clearCookie('jwt');

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
}

export default new AuthController();
