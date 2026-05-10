import { OtpVerification } from '../models/OtpVerification.js';
import { User } from '../models/User.js';
import { Vendor } from '../models/Vendor.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { generateOtp } from '../utils/otp.js';
import { sendOtpMail } from '../utils/mail.js';
import { signToken } from '../utils/tokens.js';
import { fail } from '../utils/http.js';
import { cleanString, normalizeEmail, requireFields } from '../utils/validation.js';

const OTP_TTL_MS = 10 * 60 * 1000;

const authResponse = (account, role) => ({
  token: signToken({ id: account._id, role }),
  user: {
    id: account._id,
    name: account.name,
    email: account.email,
    role,
    businessName: account.businessName
  }
});

export const requestCustomerOtp = asyncHandler(async (req, res) => {
  requireFields(req.body, ['name', 'email']);
  const name = cleanString(req.body.name);
  const email = normalizeEmail(req.body.email);
  const phone = cleanString(req.body.phone);

  const existing = await User.findOne({ email });
  if (existing?.isVerified) {
    fail('Customer already exists', 409);
  }

  await User.findOneAndUpdate(
    { email },
    { name, email, phone, role: 'customer' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const otp = generateOtp();
  await OtpVerification.create({
    email,
    otp,
    expiresAt: new Date(Date.now() + OTP_TTL_MS)
  });
  await sendOtpMail({ email, otp, name });
  res.status(201).json({ message: 'OTP sent' });
});

export const verifyCustomerOtp = asyncHandler(async (req, res) => {
  requireFields(req.body, ['email', 'otp']);
  const email = normalizeEmail(req.body.email);
  const otp = cleanString(req.body.otp);

  const record = await OtpVerification.findOne({
    email,
    otp,
    verified: false,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });

  if (!record) {
    fail('Invalid or expired OTP', 400);
  }

  record.verified = true;
  await record.save();
  const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
  if (!user) fail('Customer account not found', 404);

  res.json(authResponse(user, 'customer'));
});

export const customerLoginOtp = asyncHandler(async (req, res) => {
  requireFields(req.body, ['email']);
  const email = normalizeEmail(req.body.email);
  const user = await User.findOne({ email, role: 'customer', isVerified: true });
  if (!user) {
    fail('Verified customer not found', 404);
  }

  const otp = generateOtp();
  await OtpVerification.create({ email, otp, expiresAt: new Date(Date.now() + OTP_TTL_MS) });
  await sendOtpMail({ email, otp, name: user.name });
  res.json({ message: 'OTP sent' });
});

export const vendorSignup = asyncHandler(async (req, res) => {
  requireFields(req.body, ['name', 'email', 'password', 'businessName']);
  const vendor = await Vendor.create({
    name: cleanString(req.body.name),
    email: normalizeEmail(req.body.email),
    phone: cleanString(req.body.phone),
    password: req.body.password,
    businessName: cleanString(req.body.businessName),
    categories: Array.isArray(req.body.categories) ? req.body.categories.map(cleanString).filter(Boolean) : []
  });
  res.status(201).json(authResponse(vendor, 'vendor'));
});

export const vendorLogin = asyncHandler(async (req, res) => {
  requireFields(req.body, ['email', 'password']);
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;
  const vendor = await Vendor.findOne({ email }).select('+password');
  if (!vendor || !(await vendor.matchPassword(password))) {
    fail('Invalid vendor credentials', 401);
  }
  res.json(authResponse(vendor, 'vendor'));
});

export const adminLogin = asyncHandler(async (req, res) => {
  requireFields(req.body, ['email', 'password']);
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;
  const admin = await User.findOne({ email, role: 'admin' }).select('+password');
  if (!admin || !(await admin.matchPassword(password))) {
    fail('Invalid admin credentials', 401);
  }
  res.json(authResponse(admin, 'admin'));
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: authResponse(req.user, req.auth.role).user });
});
