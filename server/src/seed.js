import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { Booking } from './models/Booking.js';
import { Service } from './models/Service.js';
import { User } from './models/User.js';
import { Vendor } from './models/Vendor.js';

dotenv.config();

const run = async () => {
  await connectDB();
  await Promise.all([Booking.deleteMany(), Service.deleteMany(), User.deleteMany(), Vendor.deleteMany()]);

  await Vendor.create({
    name: 'Ravi Kumar',
    email: 'vendor@bookmyservice.com',
    phone: '9999999999',
    password: 'Vendor@123',
    businessName: 'Rapid Home Care',
    categories: ['Cleaning', 'Appliance']
  });

  await User.create({
    name: 'Admin',
    email: process.env.ADMIN_EMAIL || 'admin@bookmyservice.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@12345',
    role: 'admin',
    isVerified: true
  });

  console.log('Seeded admin and vendor. Services must be added from the vendor dashboard.');
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
