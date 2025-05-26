// src/validations/bet.validation.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validateRequest } from './validation.helper';

export const placeBetSchema = Joi.object({
  amount: Joi.number().positive().min(1).required().messages({
    'number.base': 'Bet amount must be a number',
    'number.positive': 'Bet amount must be positive',
    'number.min': 'Minimum bet amount is 1',
    'any.required': 'Bet amount is required',
  }),
  bet_option: Joi.string().valid('UP', 'DOWN', 'EXACT').required().messages({
    'string.base': 'Bet option must be a string',
    'any.only': 'Bet option must be one of: UP, DOWN, EXACT',
    'any.required': 'Bet option is required',
  }),
});

export const validatePlaceBet = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  validateRequest(req, res, next, placeBetSchema);
};

export const rollDiceSchema = Joi.object({
  bet_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Bet ID must be a number',
    'number.integer': 'Bet ID must be an integer',
    'number.positive': 'Bet ID must be positive',
    'any.required': 'Bet ID is required',
  }),
});

export const validateRollDice = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  validateRequest(req, res, next, rollDiceSchema);
};

