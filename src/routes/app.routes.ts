// File: src\routes\app.routes.ts
import express, { Application, Router, Express } from 'express';
import * as userRoutes from './User';
import * as betRoutes from './Bet';

export function initRoutes(app: Express, router: any) {
  router.use('/', userRoutes.initRoutes(app, express.Router()));
  router.use('/', betRoutes.initRoutes(app, express.Router()));
  router.get('/example', (req: Request, res: Response) => {});

  return router;
}
