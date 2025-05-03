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
        .where('user.email = :email', { email: email })
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
      return res.status(200).json({message:'User registered successfully'});
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

      let userRole = user.role == 1 ? "admin" : "user"
      return res.status(200).json({
        message: 'Login successful',
        token,
        user: userRole
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default new AuthController();
