import { Router } from 'express';
import { userRoutes } from './user';
import { authRoutes } from './auth';
import { blueprintRoutes } from './blueprint';
import { componentRoutes } from './component';
import { layoutRoutes } from './layout';

export const configureRoutes = (router: Router) => {
  userRoutes(router);
  authRoutes(router);
  blueprintRoutes(router);
  componentRoutes(router);
  layoutRoutes(router);
};
