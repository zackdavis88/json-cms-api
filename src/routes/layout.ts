import { Router } from 'express';
import { LayoutController, AuthController } from '../controllers';
import { LayoutValidation, AuthValidation } from '../validation';

export const layoutRoutes = (router: Router) => {
  router
    .route('/layouts')
    .all(AuthValidation.jwtHeader, AuthController.authenticateToken)
    .post(LayoutValidation.create, LayoutController.create)
    .get(LayoutValidation.getAll, LayoutController.getAll);

  router
    .route('/layouts/:layoutId')
    .all(
      AuthValidation.jwtHeader,
      AuthController.authenticateToken,
      LayoutValidation.getOne,
    )
    .get(LayoutController.getOne)
    .post(LayoutValidation.update, LayoutController.update)
    .delete(LayoutValidation.remove, LayoutController.remove);
};
