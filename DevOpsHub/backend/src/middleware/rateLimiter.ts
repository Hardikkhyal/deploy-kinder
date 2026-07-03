import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

const ipAttempts = new Map<string, { count: number; resetAt: number }>();

export const rateLimiter = (limit: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Bypass rate limits in development and testing environments
    if (process.env.NODE_ENV !== 'production') {
      return next();
    }

    // Basic IP lookup
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const record = ipAttempts.get(ip);
    
    // If no record exists or window has expired, reset the counter
    if (!record || now > record.resetAt) {
      ipAttempts.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    // Block if rate limit is exceeded
    if (record.count >= limit) {
      return next(new AppError(429, 'Too many verification attempts. Please try again later.'));
    }

    record.count++;
    next();
  };
};
