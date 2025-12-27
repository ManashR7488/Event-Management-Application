/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    return res.status(404).json({
      success: false,
      error: message,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `Duplicate field value: ${field}. Please use another value.`;
    return res.status(400).json({
      success: false,
      error: message,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    return res.status(400).json({
      success: false,
      error: message,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    return res.status(401).json({
      success: false,
      error: message,
    });
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token has expired. Please log in again.';
    return res.status(401).json({
      success: false,
      error: message,
    });
  }

  // Authorization errors (403 Forbidden)
  if (err.statusCode === 403 || err.status === 403) {
    const message = err.message || 'Access denied. You do not have permission to perform this action.';
    return res.status(403).json({
      success: false,
      error: message,
    });
  }

  // Authentication errors (401 Unauthorized)
  if (err.statusCode === 401 || err.status === 401) {
    const message = err.message || 'Authentication required. Please log in.';
    return res.status(401).json({
      success: false,
      error: message,
    });
  }

  // Default error response
  res.status(err.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
};

export default errorHandler;
