// File: src\middlewares\decryption.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { decrypt } from 'crypt-vault';
import { ENCRYPTION_ENABLED } from '../app';

/**
 * decryptData
 * @description if data comes in req.body then decrypt it and attach with req.body
 */
const decryptData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body && req.body.data && ENCRYPTION_ENABLED) {
      const decryptedData = decrypt(req.body.data);
      req.body.data = decryptedData;
    }else {
      req.body.data = req.body;
    }
    next();
  } catch (error) {
    next(error);
  }
};

export { decryptData };
