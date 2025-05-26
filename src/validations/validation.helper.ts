import { Request, Response, NextFunction } from 'express';
import Joi, { Schema } from 'joi';
import appError from '../utils/error-helper.utils';
import { ErrorType } from '../utils/error-types.utils';
import AppError from '../utils/error-helper.utils';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
  schema: Joi.ObjectSchema
): void => {
  const options = {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  };

  // Determine the data to validate
  const dataToValidate = Array.isArray(req.body.data)
    ? req.body.data[0]
    : req.body.data || req.body;

  const { error } = schema.validate(dataToValidate, options);

  if (error) {
    throw new AppError(
      `Validation error: ${error.details.map((x) => x.message).join(', ')}`,
      ErrorType.invalid_request // Assuming 400 is the status code for invalid requests
    );
  } else {
    next();
  }
};
