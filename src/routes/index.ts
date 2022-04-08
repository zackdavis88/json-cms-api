import { Router } from 'express';
import { userRoutes } from './user';
import { authRoutes } from './auth';

export const configureRoutes = (router: Router) => {
  userRoutes(router);
  authRoutes(router);
};
