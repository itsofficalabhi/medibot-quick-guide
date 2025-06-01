
const mongoose = require('mongoose');

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// MongoDB error handler
const handleMongoError = (error) => {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return new AppError(`Validation Error: ${errors.join('. ')}`, 400);
  }
  
  if (error.name === 'CastError') {
    return new AppError(`Invalid ${error.path}: ${error.value}`, 400);
  }
  
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return new AppError(`${field} already exists`, 400);
  }
  
  return new AppError('Database operation failed', 500);
};

// Global error handling middleware
const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', err);

  // MongoDB errors
  if (err.name === 'ValidationError' || err.name === 'CastError' || err.code === 11000) {
    error = handleMongoError(err);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired. Please log in again', 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  asyncHandler,
  AppError,
  globalErrorHandler
};
