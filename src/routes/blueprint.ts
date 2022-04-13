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
    .get(BlueprintController.getOne)

    /*
      TODO: Once Components exist we really need to consider how this update works.
            Components will be reliant on Blueprints to dictate their structure/contents and if
            we allow people to just update Blueprints what does that mean for the Components associated?

            Do we auto update them somehow? Thats not feasible.

            We probably will implement a check here and prevent updating Blueprints if they have associated Components.
            Maybe we make it so that an update just works as a Create and makes something new.
            
            I think the best experience is to implement a versioning system for Blueprints. We keep track of each Blueprint update
            and save the previous version in a separate DB collection.
    */
    .post(BlueprintValidation.update, BlueprintController.update);
};
