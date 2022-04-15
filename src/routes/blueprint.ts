import { Router } from 'express';
import { BlueprintController, AuthController } from '../controllers';
import { BlueprintValidation, AuthValidation } from '../validation';

export const blueprintRoutes = (router: Router) => {
  router
    .route('/blueprints')
    .all(AuthValidation.jwtHeader, AuthController.authenticateToken)
    .post(BlueprintValidation.create, BlueprintController.create)
    .get(BlueprintValidation.getAll, BlueprintController.getAll);

  router
    .route('/blueprints/:blueprintId')
    .all(
      AuthValidation.jwtHeader,
      AuthController.authenticateToken,
      BlueprintValidation.getOne,
    )
    .get(BlueprintController.getVersion, BlueprintController.getOne)
    .post(BlueprintValidation.update, BlueprintController.update)
    .delete(BlueprintValidation.remove, BlueprintController.remove);
};
