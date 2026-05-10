import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Vendor } from './models/Vendor.js';

dotenv.config();

const run = async () => {
  await connectDB();

  await Vendor.findOneAndUpdate(
    { email: 'vendor@bookmyservice.com' },
    {
      name: 'Ravi Kumar',
      email: 'vendor@bookmyservice.com',
      phone: '9999999999',
      password: 'Vendor@123',
      businessName: 'Rapid Home Care',
      categories: ['Cleaning', 'Appliance', 'Beauty', 'Repair'],
      isActive: true
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await User.findOneAndUpdate(
    { email: 'customer@bookmyservice.com' },
    {
      name: 'Demo Customer',
      email: 'customer@bookmyservice.com',
      phone: '8888888888',
      role: 'customer',
      isVerified: true
    },
    { upsert: true, setDefaultsOnInsert: true }
  );

  console.log('Seeded demo customer and vendor. Add services from the vendor dashboard.');
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
