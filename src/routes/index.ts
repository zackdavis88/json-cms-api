import { Router } from 'express';
import { testRoutes } from './test';

export const configureRoutes = (router: Router) => {
  testRoutes(router);
};
