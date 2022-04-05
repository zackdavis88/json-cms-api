import { Router } from 'express';
import { UserController } from '../controllers';
import { UserValidation } from '../validation';

export const userRoutes = (router: Router) => {
  router.route('/users').post(UserValidation.create, UserController.create);
};
