import { Sequelize } from "sequelize";
import fs from "fs";
import path from "path";
import chokidar from "chokidar";
import { sequelize } from "../config/sequelize";
import { logger } from "../logger/logger";

const basename = path.basename(__filename);

interface DbModels {
  [key: string]: any;
}

const db: DbModels = {};
let isInitialized = false;

const initializeModels = (force = false): void => {
  if (isInitialized && !force) {
    return;
  }
  
  logger.info("Initializing models...");
  
  Object.keys(db).forEach((key) => delete db[key]);

  fs.readdirSync(__dirname)
    .filter((file) => {
      return (
        file.indexOf(".") !== 0 &&
        file !== basename &&
        (file.slice(-3) === ".js" || file.slice(-3) === ".ts")
      );
    })
    .forEach((file) => {
      try {
        const modelPath = require(path.join(__dirname, file));
        const initFunction = Object.values(modelPath).find(
          (exported): exported is (sequelize: Sequelize) => any =>
            typeof exported === "function" && exported.length === 1
        );

        if (initFunction) {
          const model = initFunction(sequelize);
          if (model && model.name) {
            db[model.name] = model;
          }
        }
      } catch (error) {
        logger.error(`Error initializing model from file ${file}:`, error);
      }
    });

  Object.values(db).forEach((model) => {
    if (typeof model.associate === "function") {
      try {
        model.associate(db);
      } catch (error) {
        logger.error(`Error setting associations for model ${model.name}:`, error);
      }
    }
  });
  
  logger.info("All models and associations initialized successfully");
  isInitialized = true;
};

initializeModels(true);


if (process.env.NODE_ENV !== 'production') {
  let debounceTimer: NodeJS.Timeout;
  
  const watcher = chokidar.watch(__dirname, {
    ignored: [/index\.ts$/, /(^|[\/\\])\../],
    persistent: true,
  });

  watcher
    .on("add", (path) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => initializeModels(true), 1000);
    })
    .on("change", (path) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => initializeModels(true), 1000);
    })
    .on("error", (error) => logger.error("Watcher error:", error));
}

export { sequelize, db };
export default db;
