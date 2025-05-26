import { logger } from '../logger/logger';
import { ErrorType } from '../utils/error-types.utils';
import AppError from '../utils/error-helper.utils';

async function generateErrorResponse(
  err: any,
  status: number,
  req: any,
  res: any
) {
  // console.log('err', err);
  const errObj = {
    status: status,
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err : undefined,
  };

  logger.error(
    `${status} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );

  return res.status(status).send(errObj);
}

function generateAndSendAppErrorResponse(err: any, res: any, req: any) {
  // First check if it's an instance of AppError
  if (err instanceof AppError) {
    return generateErrorResponse(err, err.statusCode, req, res);
  }

  // If it's a Sequelize error or has a specific status code
  if (err.statusCode) {
    return generateErrorResponse(err, err.statusCode, req, res);
  }

  // Handle other types of errors based on reason
  switch (err.reason) {
    case ErrorType.invalid_request:
      return generateErrorResponse(err, 400, req, res);

    case ErrorType.not_found:
      return generateErrorResponse(err, 404, req, res);

    case ErrorType.Forbidden:
      return generateErrorResponse(err, 403, req, res);

    case ErrorType.unauthorized:
      return generateErrorResponse(err, 401, req, res);

    case ErrorType.conflict:
      return generateErrorResponse(err, 409, req, res);

    case ErrorType.validation_error:
      return generateErrorResponse(err, 400, req, res);

    case ErrorType.temp_status:
      return generateErrorResponse(err, 205, req, res);

    case ErrorType.unknown_error:
    default:
      logger.error(
        `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
      );
      return generateErrorResponse(err, 500, req, res);
  }
}

export default function errorHandlerMiddleware(
  err: any,
  req: any,
  res: any,
  next: any
) {

  return generateAndSendAppErrorResponse(err, res, req);
}