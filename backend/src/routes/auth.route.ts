import { Request, Response } from "express";
import { IRouting, ImportedRoute } from "./routing.interface";
import * as express from "express";
import authController from "../controllers/authController";
import { authenticateToken, authorizeRole, updateLastActive } from "../middleware/auth.middleware";
import { RoleEnum } from "../utils/roleEnum";
// import AuthController from '../controllers/AuthController'

@ImportedRoute.register
class AuthRoute implements IRouting {
  prefix = "/auth";

  register(app: express.Application) {
    // Public routes
    app.post(`${this.prefix}/register`, (req: Request, res: Response, next: express.NextFunction) => {
      return authController.doRegistration(req, res, next);
    });
  
    app.post(`${this.prefix}/login`, (req: Request, res: Response, next: express.NextFunction) => {
      return authController.doLogin(req, res, next);
    });

    // Protected routes
    app.get(
      `${this.prefix}/sessions`,
      authenticateToken,
      updateLastActive,
      (req: Request, res: Response, next: express.NextFunction) => {
        return authController.getSessionActivity(req, res, next);
      }
    );

    // Logout route
    app.post(
      `${this.prefix}/logout`,
      authenticateToken,
      updateLastActive,
      (req: Request, res: Response, next: express.NextFunction) => {
        return authController.doLogout(req, res, next);
      }
    );

    // Admin-only route example
    app.get(
      `${this.prefix}/admin/users`,
      authenticateToken,
      authorizeRole([RoleEnum.Admin]),
      updateLastActive,
      (req: Request, res: Response, next: express.NextFunction) => {
        return authController.getUsers(req, res, next);
      }
    );
  }
}

export default new AuthRoute();
