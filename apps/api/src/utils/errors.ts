import { ERROR_CODES } from '../constants/index.js';

export class AppError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly code: string = ERROR_CODES.INTERNAL,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class UpstreamError extends AppError {
  constructor(message: string, statusCode = 502) {
    super(message, statusCode, ERROR_CODES.UPSTREAM);
    this.name = 'UpstreamError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, ERROR_CODES.VALIDATION);
    this.name = 'ValidationError';
  }
}
