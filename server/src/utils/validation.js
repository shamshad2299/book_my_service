import mongoose from 'mongoose';
import { fail } from './http.js';

export const normalizeEmail = (value = '') => value.toString().trim().toLowerCase();

export const cleanString = (value = '') => value.toString().trim();

export const requireFields = (payload, fields) => {
  const missing = fields.filter((field) => !cleanString(payload[field]));
  if (missing.length) {
    fail(`Missing required field${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`, 400, { missing });
  }
};

export const requireObjectId = (value, label = 'id') => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    fail(`Invalid ${label}`, 400);
  }
};

export const escapeRegex = (value = '') => cleanString(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const safeRegex = (value) => new RegExp(escapeRegex(value), 'i');

export const pick = (payload, fields) =>
  fields.reduce((result, field) => {
    if (payload[field] !== undefined) result[field] = payload[field];
    return result;
  }, {});

