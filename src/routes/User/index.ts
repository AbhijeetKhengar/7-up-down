import express, { Express } from 'express';
import * as userRoutes from './users.routes';
import { END_POINT } from '../../constant/endpoint';

export function initRoutes(app: Express, router: any) {
  router.use(END_POINT.USER, userRoutes.initRoutes(app, express.Router()));
  return router;
}





