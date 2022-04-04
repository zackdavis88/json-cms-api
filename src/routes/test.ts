import { Router, Response, Request } from 'express';

export const testRoutes = (router: Router) => {
  router
    .route('/test')
    .get((req: Request, res: Response) => res.success('Hello, World!'));
};
