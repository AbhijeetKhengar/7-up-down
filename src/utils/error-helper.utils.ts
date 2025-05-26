import { ErrorType } from './error-types.utils';
import { Response } from 'express';
 
class AppError extends Error {
  public statusCode: number;
  public message: string;
  public reason: ErrorType;
 
  constructor(message: string, errorType: ErrorType = ErrorType.unknown_error) {
    super(message);
    this.message = message;
    this.reason = errorType;
 
    // Set statusCode based on errorType
    switch (errorType) {
      case ErrorType.invalid_request:
        this.statusCode = 400;
        break;
      case ErrorType.unauthorized:
        this.statusCode = 401;
        break;
      case ErrorType.Forbidden:
        this.statusCode = 403;
        break;
      case ErrorType.not_found:
        this.statusCode = 404;
        break;
      case ErrorType.conflict:
        this.statusCode = 409;
        break;
      case ErrorType.validation_error:
        this.statusCode = 400;
        break;
      case ErrorType.too_many_requests:
        this.statusCode = 429;
        break;
      case ErrorType.temp_status:
        this.statusCode = 205;
        break;
      default:
        this.statusCode = 500;
    }
 
    Object.setPrototypeOf(this, AppError.prototype);
  }
 
  public sendErrorResponse(res: Response) {
    return res.status(this.statusCode).json({
      status: 'error',
      message: this.message,
    });
  }
}
 
export default AppError;