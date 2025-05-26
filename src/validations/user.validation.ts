import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validateRequest } from './validation.helper';

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

export const validateUserLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  validateRequest(req, res, next, userLoginSchema);
};
