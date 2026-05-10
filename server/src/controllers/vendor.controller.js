import { Booking } from '../models/Booking.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { fail } from '../utils/http.js';
import { sendBookingStatusMail } from '../utils/mail.js';
import { requireFields, requireObjectId } from '../utils/validation.js';

const vendorPopulate = [
  { path: 'service', select: 'title category city price imageUrl vendor' },
  { path: 'customer', select: 'name email phone' },
  { path: 'vendor', select: 'name businessName phone email' }
];

export const assignedBookings = asyncHandler(async (req, res) => {
  res.json(await Booking.find({ vendor: req.user._id }).populate(vendorPopulate).lean().sort({ createdAt: -1 }));
});

export const updateAssignedBooking = asyncHandler(async (req, res) => {
  requireFields(req.body, ['status']);
  requireObjectId(req.params.id, 'booking id');
  const { status } = req.body;
  if (!['accepted', 'rejected', 'delivered'].includes(status)) {
    fail('Invalid vendor status', 400);
  }

  const booking = await Booking.findOneAndUpdate(
    { _id: req.params.id, vendor: req.user._id },
    { status },
    { new: true }
  ).populate(vendorPopulate);

  if (!booking) {
    fail('Booking not found', 404);
  }
  await sendBookingStatusMail({ booking });
  res.json(booking);
});

export const vendorStats = asyncHandler(async (req, res) => {
  const stats = await Booking.aggregate([
    { $match: { vendor: req.user._id } },
    { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$amount' } } }
  ]);
  res.json({ stats });
});
