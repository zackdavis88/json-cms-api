import { Router } from 'express';
import { userRoutes } from './user';
import { authRoutes } from './auth';
import { blueprintRoutes } from './blueprint';
export const configureRoutes = (router: Router) => {
  userRoutes(router);
  authRoutes(router);
  blueprintRoutes(router);
};
