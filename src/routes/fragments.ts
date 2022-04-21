import { Router } from 'express';
import { FragmentController, AuthController } from '../controllers';
import { FragmentValidation, AuthValidation } from '../validation';

export const fragmentRoutes = (router: Router) => {
  router
    .route('/fragments')
    .all(AuthValidation.jwtHeader, AuthController.authenticateToken)
    .post(FragmentValidation.create, FragmentController.create)
    .get(FragmentValidation.getAll, FragmentController.getAll);

  router
    .route('/fragments/:fragmentName')
    .all(
      AuthValidation.jwtHeader,
      AuthController.authenticateToken,
      FragmentValidation.getOne,
    )
    .get(FragmentController.getOne)
    .post(FragmentValidation.update, FragmentController.update)
    .delete(FragmentValidation.remove, FragmentController.remove);
};
