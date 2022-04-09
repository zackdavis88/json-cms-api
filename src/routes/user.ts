import { Router } from 'express';
import { UserController, AuthController } from '../controllers';
import { UserValidation, AuthValidation } from '../validation';

export const userRoutes = (router: Router) => {
  router.route('/users').post(UserValidation.create, UserController.create);

  router
    .route('/users/:username')
    .all(AuthValidation.jwtHeader, AuthController.authenticateToken)
    .get(UserValidation.getOne, UserController.getOne);
};
