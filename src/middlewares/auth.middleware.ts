import { Request, Response, NextFunction } from 'express';
import { db } from '../models';
import AppError from '../utils/error-helper.utils';
import { ErrorType } from '../utils/error-types.utils';
import { localizationService } from '../services/localization.service';

declare global {
  namespace Express {
    interface Request {
      user?: any;
      token?: string;
      loginId?: string;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(
        localizationService.translations.auth.noToken,
        ErrorType.unauthorized
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Find login record by token
    const loginRecord = await db.UserLoginDetail.findOne({
      where: {
        token: token,
      },
    });

    if (!loginRecord) {
      throw new AppError(
        localizationService.translations.auth.invalidSession,
        ErrorType.unauthorized
      );
    }

    // Check if token is expired
    if (loginRecord.expires_at && new Date() > new Date(loginRecord.expires_at)) {
      
      throw new AppError(
        localizationService.translations.auth.sessionExpired,
        ErrorType.unauthorized
      );
    }

    // Find user
    const user = await db.User.findOne({
      where: {
        id: loginRecord.user_id,
      },
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      throw new AppError(
        localizationService.translations.user.notExist,
        ErrorType.unauthorized
      );
    }

    // Attach user and token info to request
    req.user = user;
    req.token = token;
    req.loginId = loginRecord.id;

    next();
  } catch (error) {
    next(error);
  }
};
