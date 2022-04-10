import { Router } from 'express';
import { BlueprintController, AuthController } from '../controllers';
import { BlueprintValidation, AuthValidation } from '../validation';

export const blueprintRoutes = (router: Router) => {
  router
    .route('/blueprints')
    .all(AuthValidation.jwtHeader, AuthController.authenticateToken)
    .post(BlueprintValidation.create, BlueprintController.create)
    .get(BlueprintValidation.getAll, BlueprintController.getAll);
};
