import crypto from 'crypto';

export const generateOtp = () => crypto.randomInt(100000, 1000000).toString();
