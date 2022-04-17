import { Router } from 'express';
import { ComponentController, AuthController } from '../controllers';
import { ComponentValidation, AuthValidation } from '../validation';

export const componentRoutes = (router: Router) => {
  router
    .route('/components')
    .all(AuthValidation.jwtHeader, AuthController.authenticateToken)
    .post(ComponentValidation.create, ComponentController.create)
    .get(ComponentValidation.getAll, ComponentController.getAll);
};
