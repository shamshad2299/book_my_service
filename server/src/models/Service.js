import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    city: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    imageUrl: { type: String },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

serviceSchema.index({ title: 1, city: 1, vendor: 1 }, { unique: true });

export const Service = mongoose.model('Service', serviceSchema);
