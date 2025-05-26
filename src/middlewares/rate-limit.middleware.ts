import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { ErrorType } from '../utils/error-types.utils';
import AppError from '../utils/error-helper.utils';
import { localizationService } from '../services/localization.service';

// Define different rate limiters for different endpoints
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes',
  handler: (req: Request, res: Response) => {
    throw new AppError(
      localizationService.translations.auth.rateLimitExceeded,
      ErrorType.too_many_requests
    );
  }
});

// More strict limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 login attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts from this IP, please try again after an hour',
  handler: (req: Request, res: Response) => {
    throw new AppError(
      localizationService.translations.auth.tooManyLoginAttempts,
      ErrorType.too_many_requests
    );
  }
});

// Limiter for bet placement
export const betLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 bet placements per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many bet placements, please slow down',
  handler: (req: Request, res: Response) => {
    throw new AppError(
      localizationService.translations.auth.tooManyBets,
      ErrorType.too_many_requests
    );
  }
});

// Limiter for dice rolling
export const diceLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 dice rolls per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many dice rolls, please slow down',
  handler: (req: Request, res: Response) => {
    throw new AppError(
      localizationService.translations.auth.tooManyDiceRolls,
      ErrorType.too_many_requests
    );
  }
});
