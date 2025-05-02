import { Router } from 'express';
import authController from '../controllers/authController';
import { trackActivity } from '../middleware/activityTracker';

const routerx = Router();

routerx.post('/register', authController.doRegistration);
routerx.post('/login', authController.doLogin);
routerx.get('/sessions', trackActivity, authController.getSessionActivity);

export default routerx; 