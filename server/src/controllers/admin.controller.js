import { Booking } from '../models/Booking.js';
import { Service } from '../models/Service.js';
import { User } from '../models/User.js';
import { Vendor } from '../models/Vendor.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { fail } from '../utils/http.js';
import { sendBookingAssignedMail, sendBookingStatusMail } from '../utils/mail.js';
import { requireFields, requireObjectId } from '../utils/validation.js';

const bookingPopulate = [
  { path: 'service', select: 'title category city price vendor' },
  { path: 'customer', select: 'name email phone' },
  { path: 'vendor', select: 'name businessName phone email' }
];

const notify = (task) => {
  task().catch((error) => {
    console.error(`Email notification failed: ${error.message}`);
  });
};

export const adminOverview = asyncHandler(async (_req, res) => {
  const [users, vendors, bookings, services] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    Vendor.countDocuments(),
    Booking.countDocuments(),
    Service.countDocuments()
  ]);
  res.json({ users, vendors, bookings, services });
});

export const listUsers = asyncHandler(async (_req, res) => {
  res.json(await User.find().select('-password').lean().sort({ createdAt: -1 }));
});

export const listVendors = asyncHandler(async (_req, res) => {
  res.json(await Vendor.find().select('-password').lean().sort({ createdAt: -1 }));
});

export const listBookings = asyncHandler(async (_req, res) => {
  res.json(await Booking.find().populate(bookingPopulate).lean().sort({ createdAt: -1 }));
});

export const assignVendor = asyncHandler(async (req, res) => {
  requireFields(req.body, ['vendorId']);
  requireObjectId(req.params.id, 'booking id');
  requireObjectId(req.body.vendorId, 'vendorId');

  const vendor = await Vendor.findOne({ _id: req.body.vendorId, isActive: true });
  if (!vendor) fail('Active vendor not found', 404);

  const bookingToAssign = await Booking.findById(req.params.id).populate({ path: 'service', select: 'vendor' });
  if (!bookingToAssign) {
    fail('Booking not found', 404);
  }
  if (bookingToAssign.service?.vendor?.toString() !== vendor._id.toString()) {
    fail('Booking vendor must match the vendor that owns the selected service', 409);
  }

  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { vendor: req.body.vendorId, status: 'assigned' },
    { new: true }
  ).populate(bookingPopulate);

  if (!booking) {
    fail('Booking not found', 404);
  }
  notify(() => sendBookingAssignedMail({ booking }));
  res.json(booking);
});

export const updateBookingStatus = asyncHandler(async (req, res) => {
  requireFields(req.body, ['status']);
  requireObjectId(req.params.id, 'booking id');
  if (!['pending', 'assigned', 'accepted', 'rejected', 'delivered', 'cancelled'].includes(req.body.status)) {
    fail('Invalid booking status', 400);
  }

  const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).populate(
    bookingPopulate
  );
  if (!booking) {
    fail('Booking not found', 404);
  }
  notify(() => sendBookingStatusMail({ booking }));
  res.json(booking);
});
