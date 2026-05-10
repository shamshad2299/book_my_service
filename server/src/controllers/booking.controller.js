import { Booking } from '../models/Booking.js';
import { Service } from '../models/Service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { fail } from '../utils/http.js';
import { sendBookingCreatedMail } from '../utils/mail.js';
import { cleanString, requireFields, requireObjectId } from '../utils/validation.js';

const populate = [
  { path: 'service', select: 'title category city imageUrl' },
  { path: 'vendor', select: 'name businessName phone email' },
  { path: 'customer', select: 'name email phone' }
];

export const createBooking = asyncHandler(async (req, res) => {
  requireFields(req.body, ['serviceId', 'scheduledAt', 'address']);
  requireObjectId(req.body.serviceId, 'serviceId');

  const scheduledAt = new Date(req.body.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) {
    fail('scheduledAt must be a future date and time', 400);
  }

  const service = await Service.findOne({ _id: req.body.serviceId, isActive: true }).populate({
    path: 'vendor',
    select: 'isActive'
  });
  if (!service) {
    fail('Service not found', 404);
  }
  if (!service.vendor?._id || !service.vendor.isActive) {
    fail('Service is not attached to an active vendor', 409);
  }

  const booking = await Booking.create({
    customer: req.user._id,
    service: service._id,
    vendor: service.vendor._id,
    scheduledAt,
    address: cleanString(req.body.address),
    notes: cleanString(req.body.notes),
    amount: service.price
  });
  const populatedBooking = await booking.populate(populate);
  await sendBookingCreatedMail({ booking: populatedBooking });
  res.status(201).json(populatedBooking);
});

export const myBookings = asyncHandler(async (req, res) => {
  res.json(await Booking.find({ customer: req.user._id }).populate(populate).lean().sort({ createdAt: -1 }));
});

export const rateBooking = asyncHandler(async (req, res) => {
  requireFields(req.body, ['rating']);
  requireObjectId(req.params.id, 'booking id');

  const rating = Number(req.body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    fail('Rating must be a whole number from 1 to 5', 400);
  }

  const booking = await Booking.findOne({ _id: req.params.id, customer: req.user._id });
  if (!booking) {
    fail('Booking not found', 404);
  }
  if (booking.status !== 'delivered') {
    fail('Only delivered bookings can be rated', 409);
  }

  booking.rating = rating;
  booking.review = cleanString(req.body.review);
  booking.ratedAt = new Date();
  await booking.save();

  res.json(await booking.populate(populate));
});
