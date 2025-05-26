import cors from "cors";
import { initializeEncryption } from "crypt-vault";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import errorHandlerMiddleware from "../src/middlewares/error.middleware";
import { logger } from "./logger/logger";
import { sequelize } from "./models/index";
import { initRoutes } from "./routes/index";
import { localizationService } from "./services/localization.service";
import { globalLimiter } from "./middlewares/rate-limit.middleware";

// Load environment variables first
dotenv.config();

export const ENCRYPTION_ENABLED = process.env.ENCRYPTION === "true";

class App {
  public app: Express;
  private PORT: number | string;

  constructor() {
    this.app = express();
    this.PORT = process.env.PORT || 3000;

    // Initialize core components
    this.initializeCore();

    // Initialize middlewares
    this.initializeMiddlewares();

    // Start the application
    this.start();
  }

  // Modified/New Code
  private initializeCore() {
    // Initialize encryption only if enabled
    if (!process.env.TERIFF || !process.env.PLAN) {
      logger.warn("Missing encryption configuration");
    } else {
      initializeEncryption(process.env.TERIFF, process.env.PLAN);
      logger.info("Encryption initialized successfully");
    }

    // Set locale
    localizationService.setLocale("en");
    logger.info("Localization set to: en");
  }

  private initializeMiddlewares() {

    this.app.use(globalLimiter);
    // CORS configuration
    this.app.use(
      cors({
        origin: "*",
      })
    );

    // Request parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true, limit: "500mb" }));
  }

  private async start() {
    try {
      // Initialize database first
      await this.initializeDatabase();

      // Then initialize routes
      this.initializeRoutes();

      // Start the server
      this.startServer();
    } catch (error) {
      logger.error("Application failed to start:", error);
      process.exit(1);
    }
  }

  private async initializeDatabase() {
    try {
      // Authenticate the database connection
      await sequelize.authenticate();
      logger.info("Database connection established successfully.");

      try {
        const syncOptions = {
          // Use alter:true in development, force:false in production
          alter: process.env.NODE_ENV !== 'production' && process.env.DB_SYNC_ALTER === 'true',
          force: process.env.DB_SYNC_FORCE === 'true', // Be careful with this!
        };

        logger.info(`Syncing database with options: ${JSON.stringify(syncOptions)}`);
        await sequelize.sync(syncOptions);
        logger.info("Database schema synchronized successfully.");
      } catch (syncError: any) {
        logger.warn(`Database sync encountered issues: ${syncError.message}`);
      }
    } catch (error) {
      logger.error("✗ Unable to connect to the database:", error);
      throw error;
    }
  }

  private initializeRoutes() {

    // Initialize your routes
    initRoutes(this.app);

    // Then your custom error handler
    this.app.use(errorHandlerMiddleware);

    // Catch-all route for unhandled routes
    this.app.use((req: Request, res: Response) => {
      logger.warn(`Route not found: ${req.originalUrl}`);
      res.status(404).json({ message: "Route not found" });
    });
  }

  private startServer() {
    this.app.listen(this.PORT, () => {
      logger.info(`Server is running on port ${this.PORT}`);
    });
  }
}

new App();
