import type { ErrorRequestHandler } from 'express';
import { AppError } from '../utils/errors.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  void next;

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message, code: err.code });
    return;
  }

  console.error('[api] unhandled error', err);
  res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
};
