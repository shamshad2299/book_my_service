export const notFound = (req, _res, next) => {
  const error = new Error(`Not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || (err.code === 11000 ? 409 : err.name === 'ValidationError' ? 422 : 500);
  const message =
    err.code === 11000
      ? `Duplicate value for ${Object.keys(err.keyPattern || {}).join(', ') || 'unique field'}`
      : err.name === 'JsonWebTokenError'
        ? 'Invalid authentication token'
        : err.name === 'TokenExpiredError'
          ? 'Authentication token expired'
          : err.message || 'Server error';

  res.status(statusCode).json({
    message,
    details: err.details,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};
