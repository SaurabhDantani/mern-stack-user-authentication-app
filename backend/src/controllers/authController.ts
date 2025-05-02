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
      const memberRepo = connection.getRepository(User)
      const memberSessionRepo = connection.getRepository(UserSession)

      const member = await memberRepo
        .createQueryBuilder('user')
        .where('user.email = :email', { email: email })
        .getOne();


      if (!member) {
        return res.status(401).json({ message: 'User not found' });
      }


      if (!member.password) {
        return res.status(401).json({ message: 'Password not set' });
      }

      const isPasswordValid = await bcrypt.compare(password, member.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid password' });
      }

      const token = Jwt.sign({ member }, process.env.AUTH_SECRET_KEY || 'default_secret_key', {
        expiresIn: '1h',
      });

      // Invalidate previous sessions
      await memberSessionRepo.update(
        { user: member, isActive: true },
        { isActive: false }
      );

      // Create new session
      const newSession = memberSessionRepo.create({
        user: member,
        ipAddress: ip || "",
        userAgent: userAgent,
        jwtToken: token,
        isActive: true,
        lastActiveAt: new Date()
      });

      await memberSessionRepo.save(newSession);

      return res.status(200).json({ token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'error', error });
    }
  }

  async getSessionActivity(req: Request, res: Response, next: NextFunction) {
    try {
      let token = req.headers['authorization']?.split(' ')[1];
      let userId;

      // if (!token) {
      //   token = req.cookies['auth_token'];
      // }

      if (!token) {
        return res.status(401).json({ message: "Authentication token is missing" });
      }

      // try {
      //   const decoded = Jwt.verify(token, secretKey) as any;
      //   req.user = decoded;
      //   userId = decoded.member.id;
      // } catch (err) {
      //   return res.status(401).json({ message: "Invalid token" });
      // }

      const connection = await dbUtils.getDefaultConnection();
      const sessionRepo = connection.getRepository(UserSession);

      const sessions = await sessionRepo.find({
        where: { user: { id: 1 } },
        order: { lastActiveAt: 'DESC' }
      });

      return res.status(200).json({
        sessions: sessions.map(session => ({
          id: session.id,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          loginTime: session.createdAt,
          lastActive: session.lastActiveAt,
          isActive: session.isActive
        }))
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error fetching session activity' });
    }
  }
}

export default new AuthController();
