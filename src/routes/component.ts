import { Router } from 'express';
import { ComponentController, AuthController } from '../controllers';
import { ComponentValidation, AuthValidation } from '../validation';

export const componentRoutes = (router: Router) => {
  router
    .route('/components')
    .all(AuthValidation.jwtHeader, AuthController.authenticateToken)
    .post(ComponentValidation.create, ComponentController.create)
    .get(ComponentValidation.getAll, ComponentController.getAll);

  router
    .route('/components/:componentId')
    .all(
      AuthValidation.jwtHeader,
      AuthController.authenticateToken,
      ComponentValidation.getOne,
    )
    .get(
      ComponentValidation.getBlueprintVersion,
      ComponentController.getVersion,
      ComponentController.getOne,
    )
    .post(
      ComponentValidation.getBlueprintVersion,
      ComponentValidation.update,
      ComponentController.update,
    )
    .delete(ComponentValidation.remove, ComponentController.remove);
};
