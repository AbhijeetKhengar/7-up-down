import { Express } from 'express';
import BetController from '../../controllers/Bet/bet.controller';
import { END_POINT } from '../../constant/endpoint';
import { validatePlaceBet, validateRollDice } from '../../validations/bet.validation';
import { authenticate } from '../../middlewares/auth.middleware';
import { betLimiter, diceLimiter } from '../../middlewares/rate-limit.middleware';

export function initRoutes(app: Express, router: any) {
  const apiRoute = router;
  const betController = new BetController();

  // Place bet route
  apiRoute.post(
    END_POINT.PLACE_BET, 
    betLimiter,
    authenticate, 
    validatePlaceBet, 
    betController.placeBet
  );

  // Roll dice route
  apiRoute.post(
    END_POINT.ROLL_DICE,
    diceLimiter,
    authenticate,
    validateRollDice,
    betController.rollDice
  );

  return apiRoute;
}
