import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Vendor } from '../models/Vendor.js';
import { asyncHandler } from './asyncHandler.js';
import { AppError, fail } from '../utils/http.js';

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    fail('Authentication required', 401);
  }

  if (!process.env.JWT_SECRET) {
    fail('JWT_SECRET is required', 500);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const Model = decoded.role === 'vendor' ? Vendor : User;
  const account = await Model.findById(decoded.id).select('-password');
  if (!account) {
    fail('Account not found', 401);
  }

  req.user = account;
  req.auth = decoded;
  next();
});

export const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.auth?.role)) {
    return next(new AppError('Forbidden', 403));
  }
  next();
};
