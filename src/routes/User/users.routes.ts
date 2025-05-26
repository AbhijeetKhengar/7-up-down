import { Express } from 'express';
import UserController from '../../controllers/User/user.controller';
import { END_POINT } from '../../constant/endpoint';

import {
  validateUserLogin,
} from '../../validations/index';
import { authenticate } from '../../middlewares/auth.middleware';
import { authLimiter } from '../../middlewares/rate-limit.middleware';

export function initRoutes(app: Express, router: any) {
  const apiRoute = router;
  const userController = new UserController();

  apiRoute.post(END_POINT.LOGIN, authLimiter, validateUserLogin, userController.login);
  apiRoute.get(END_POINT.PROFILE, authenticate, userController.getUserProfile);


  return apiRoute;
}
