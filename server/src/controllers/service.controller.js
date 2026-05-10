import { Service } from '../models/Service.js';
import { Vendor } from '../models/Vendor.js';
import { Booking } from '../models/Booking.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { fail } from '../utils/http.js';
import { cleanString, pick, requireFields, requireObjectId, safeRegex } from '../utils/validation.js';

const servicePopulate = { path: 'vendor', select: 'name businessName phone email categories isActive' };

const attachRatings = async (services) => {
  const serviceIds = services.map((service) => service._id);
  const ratings = await Booking.aggregate([
    { $match: { service: { $in: serviceIds }, status: 'delivered', rating: { $gte: 1, $lte: 5 } } },
    { $group: { _id: '$service', averageRating: { $avg: '$rating' }, ratingCount: { $sum: 1 } } }
  ]);
  const ratingMap = new Map(ratings.map((item) => [item._id.toString(), item]));
  return services.map((service) => {
    const rating = ratingMap.get(service._id.toString());
    return {
      ...service,
      averageRating: rating ? Number(rating.averageRating.toFixed(1)) : null,
      ratingCount: rating?.ratingCount || 0
    };
  });
};

export const listServices = asyncHandler(async (req, res) => {
  const { city, category, q } = req.query;
  const filter = { isActive: true };
  if (city) filter.city = safeRegex(city);
  if (category) filter.category = safeRegex(category);
  if (q) filter.$or = [{ title: safeRegex(q) }, { description: safeRegex(q) }];
  const services = await Service.find(filter).populate(servicePopulate).lean().sort({ createdAt: -1 });
  res.json(await attachRatings(services));
});

export const listVendorServices = asyncHandler(async (req, res) => {
  res.json(await Service.find({ vendor: req.user._id }).populate(servicePopulate).lean().sort({ createdAt: -1 }));
});

export const createService = asyncHandler(async (req, res) => {
  requireFields(req.body, ['title', 'category', 'description', 'city', 'price']);
  const payload = pick(req.body, ['title', 'category', 'description', 'city', 'price', 'imageUrl', 'isActive', 'vendor']);
  const vendorId = req.auth?.role === 'vendor' ? req.user._id : payload.vendor;

  requireObjectId(vendorId, 'vendor');
  const vendor = await Vendor.findOne({ _id: vendorId, isActive: true });
  if (!vendor) {
    fail('Active vendor not found', 404);
  }

  const price = Number(payload.price);
  if (!Number.isFinite(price) || price < 0) {
    fail('Price must be a valid non-negative number', 400);
  }

  const service = await Service.create({
    ...payload,
    vendor: vendor._id,
    price,
    title: cleanString(payload.title),
    category: cleanString(payload.category),
    description: cleanString(payload.description),
    city: cleanString(payload.city),
    imageUrl: cleanString(payload.imageUrl)
  });
  res.status(201).json(await service.populate(servicePopulate));
});

export const updateVendorService = asyncHandler(async (req, res) => {
  requireObjectId(req.params.id, 'service id');
  const payload = pick(req.body, ['title', 'category', 'description', 'city', 'price', 'imageUrl', 'isActive']);
  const update = {};

  ['title', 'category', 'description', 'city', 'imageUrl'].forEach((field) => {
    if (payload[field] !== undefined) {
      update[field] = cleanString(payload[field]);
    }
  });

  ['title', 'category', 'description', 'city'].forEach((field) => {
    if (payload[field] !== undefined && !update[field]) {
      fail(`${field} cannot be empty`, 400);
    }
  });

  if (payload.price !== undefined) {
    const price = Number(payload.price);
    if (!Number.isFinite(price) || price < 0) {
      fail('Price must be a valid non-negative number', 400);
    }
    update.price = price;
  }

  if (payload.isActive !== undefined) {
    update.isActive = Boolean(payload.isActive);
  }

  const service = await Service.findOneAndUpdate(
    { _id: req.params.id, vendor: req.user._id },
    update,
    { new: true, runValidators: true }
  ).populate(servicePopulate);

  if (!service) {
    fail('Service not found', 404);
  }

  res.json(service);
});
