class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Mark as a known operational error

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;