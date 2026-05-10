import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    scheduledAt: { type: Date, required: true },
    address: { type: String, required: true },
    notes: { type: String },
    amount: { type: Number, required: true },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String, trim: true },
    ratedAt: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'accepted', 'rejected', 'delivered', 'cancelled'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

export const Booking = mongoose.model('Booking', bookingSchema);
