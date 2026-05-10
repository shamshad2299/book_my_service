import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true, select: false },
    businessName: { type: String, required: true, trim: true },
    categories: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
    role: { type: String, default: 'vendor' }
  },
  { timestamps: true }
);

vendorSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

vendorSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.password);
};

export const Vendor = mongoose.model('Vendor', vendorSchema);
