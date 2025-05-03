import { Request, Response } from "express";
import { IRouting, ImportedRoute } from "./routing.interface";
import * as express from "express";
import user from "../controllers/userController";
import { authenticateToken, authorizeRole, updateLastActive } from "../middleware/auth.middleware";
import { RoleEnum } from "../utils/roleEnum";

@ImportedRoute.register
class UserRoute implements IRouting {
  prefix = "";
  register(app: express.Application) {

    // Protected routes
    app.get(
      '/sessions/active',
      authenticateToken,
      updateLastActive,
      (req: Request, res: Response, next: express.NextFunction) => {
        return user.getSessionActivity(req, res, next);
      }
    );

    // Logout route
    app.post(
      '/auth/logout',
      authenticateToken,
      updateLastActive,
      (req: Request, res: Response, next: express.NextFunction) => {
        return user.doLogout(req, res, next);
      }
    );

    app.get(
      `/user/profile`,
      authenticateToken,
      // authorizeRole([RoleEnum.Admin]),
      updateLastActive,
      (req: Request, res: Response, next: express.NextFunction) => {
        return user.getProfile(req, res, next);
      }
    );

    // Admin-only route example
    app.get(
      `/admin/users`,
      authenticateToken,
      authorizeRole([RoleEnum.Admin]),
      updateLastActive,
      (req: Request, res: Response, next: express.NextFunction) => {
        return user.getUsers(req, res, next);
      }
    );

    app.get(
      `/admin/dashboard`,
      authenticateToken,
      authorizeRole([RoleEnum.Admin]),
      updateLastActive,
      (req: Request, res: Response, next: express.NextFunction) => {
        return user.getUsers(req, res, next);
      }
    );

  }
}

export default new UserRoute();
