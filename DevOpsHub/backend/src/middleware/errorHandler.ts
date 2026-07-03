import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  Logger.error(`Route Error on ${req.method} ${req.url}: ${message}`, err);

  res.status(statusCode).json({
    error: err.name || 'Error',
    message
  });
};
