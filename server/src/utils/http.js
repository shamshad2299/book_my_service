export class AppError extends Error {
  constructor(message, statusCode = 500, details) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const fail = (message, statusCode = 400, details) => {
  throw new AppError(message, statusCode, details);
};

export const notFound = (resource = 'Resource') => fail(`${resource} not found`, 404);

