import { Router } from 'express';
import { UserController, AuthController } from '../controllers';
import { UserValidation, AuthValidation } from '../validation';

export const userRoutes = (router: Router) => {
  router
    .route('/users')
    .post(UserValidation.create, UserController.create)
    .get(
      AuthValidation.jwtHeader,
      AuthController.authenticateToken,
      UserValidation.getAll,
      UserController.getAll,
    );

  router
    .route('/users/:username')
    .all(AuthValidation.jwtHeader, AuthController.authenticateToken)
    .get(UserValidation.getOne, UserController.getOne);
};
