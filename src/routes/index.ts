import express, { Express, Request, Response, NextFunction } from "express";
import * as appRoutes from "../routes/app.routes";
import * as testRoutes from "./test.routes";
import { decryptData } from "../middlewares/decryption.middleware";
import AppError from "../utils/error-helper.utils";
import { localizationService } from "../services/localization.service";
import { ErrorType } from "../utils/error-types.utils";
// import { decryptData } from '../middlewares/encrypt.middleware';

const isLocalhost = (req: Request) => req.hostname === "localhost";

export function initRoutes(app: Express) {
  const router = express.Router();
  testRoutes.initRoutes(app, router);

  appRoutes.initRoutes(app, router);

  app.use(decryptData);
  app.use("/api", router);

  app.use("*", (req: Request, res: Response, next: NextFunction) => {
    try {
      throw new AppError(
        localizationService.translations.router.invalidRoute,
        ErrorType.not_found
      );
    } catch (error) {
      next(error);
    }
  });
}
