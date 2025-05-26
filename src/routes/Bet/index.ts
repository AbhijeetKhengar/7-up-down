import express, { Express } from 'express';
import * as betRoutes from './bet.routes';
import { END_POINT } from '../../constant/endpoint';

export function initRoutes(app: Express, router: any) {
  router.use(END_POINT.BET, betRoutes.initRoutes(app, express.Router()));
  return router;
}