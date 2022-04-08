import { Router } from 'express';
import { AuthController } from '../controllers';
import { AuthValidation } from '../validation';

export const authRoutes = (router: Router) => {
  router.route('/auth').get(AuthValidation.basicHeader, AuthController.generateToken);

  router
    .route('/auth/token')
    .get(AuthValidation.jwtHeader, AuthController.authenticateToken, (req, res) => {
      const { user } = req;
      const userData = {
        user: {
          username: user.username,
          displayName: user.displayName,
          createdOn: user.createdOn,
          updatedOn: user.updatedOn,
        },
      };
      return res.success('user successfully authenticated via token', userData);
    });
};
