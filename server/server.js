import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { initSocket } from './socket.js';
import { errorHandler } from './middleware/error.js';

import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import productRoutes from './routes/productRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import User from './models/User.js';
import Order from './models/Order.js';
import Product from './models/Product.js';

dotenv.config();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = initSocket(httpServer);
  app.set('io', io);

  const PORT = 3000;

  // Middleware
  app.use(express.json());
  app.use(cookieParser());
  app.use(cors({
    origin: true,
    credentials: true
  }));

  // Database Connection
  let dbUri = process.env.MONGODB_URI;
  
  if (!dbUri || (!dbUri.startsWith('mongodb://') && !dbUri.startsWith('mongodb+srv://'))) {
    console.log('⚠️ No valid MONGODB_URI found. Starting in-memory MongoDB...');
    const mongod = await MongoMemoryServer.create();
    dbUri = mongod.getUri();
  }

  console.log(`Attempting to connect to MongoDB at: ${dbUri}`);

  try {
    await mongoose.connect(dbUri);
    console.log('✅ MongoDB Connected successfully');

    // Seed Admin User
    const adminEmail = 'admin@gmail.com';
    let admin = await User.findOne({ email: adminEmail });
    
    if (!admin) {
      console.log('Seeding admin user...');
      admin = await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: 'esec@123',
        role: 'admin'
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    // Seed Sample Products first (needed for order references)
    const productCount = await Product.countDocuments();
    let seededProducts = await Product.find().limit(3).lean();
    if (productCount === 0 && admin) {
      console.log('Seeding sample products...');
      const created = await Product.create([
        { name: 'Wireless Noise Cancelling Headphones', price: 299.99, description: 'Premium sound with ANC technology. Up to 30h battery life.', category: 'Electronics', stock: 45, createdBy: admin._id },
        { name: 'Mechanical Gaming Keyboard', price: 149.99, description: 'RGB backlit, Cherry MX switches, wrist rest included.', category: 'Electronics', stock: 80, createdBy: admin._id },
        { name: '4K Webcam Pro', price: 119.99, description: 'Crystal-clear 4K video with built-in ring light and mic.', category: 'Electronics', stock: 60, createdBy: admin._id },
        { name: 'Ergonomic Office Chair', price: 449.00, description: 'Lumbar support, adjustable armrests, mesh backrest.', category: 'Furniture', stock: 20, createdBy: admin._id },
        { name: 'Standing Desk (Electric)', price: 599.00, description: 'Height adjustable 60"-wide desktop, memory settings.', category: 'Furniture', stock: 15, createdBy: admin._id },
        { name: 'LED Desk Lamp', price: 49.99, description: 'Touch dimmer, USB-C charging port, 5000K daylight.', category: 'Accessories', stock: 120, createdBy: admin._id },
        { name: 'Portable SSD 2TB', price: 189.99, description: 'NVMe speeds up to 2000MB/s. USB-C, bus powered.', category: 'Storage', stock: 90, createdBy: admin._id },
        { name: 'Smart WiFi Power Strip', price: 34.99, description: '4 AC outlets, 3 USB ports, Alexa/Google compatible.', category: 'Accessories', stock: 150, createdBy: admin._id },
      ]);
      seededProducts = created;
      console.log('Sample products seeded successfully');
    } else {
      console.log('Products already exist or admin not found');
    }

    // Seed Sample Orders if none exist — reference real product IDs
    const orderCount = await Order.countDocuments();
    if (orderCount === 0 && admin && seededProducts.length >= 2) {
      console.log('Seeding sample orders...');
      const p0 = seededProducts[0]; // headphones
      const p1 = seededProducts[1]; // keyboard
      await Order.create([
        {
          firstName: 'John', lastName: 'Doe',
          email: 'john@example.com', phoneNumber: '1234567890',
          streetAddress: '123 Main St', city: 'New York', state: 'NY', postalCode: '10001', country: 'USA',
          product: p0.name, productId: p0._id,
          quantity: 1, unitPrice: p0.price, totalAmount: p0.price * 1,
          status: 'Completed', createdBy: admin._id
        },
        {
          firstName: 'Jane', lastName: 'Smith',
          email: 'jane@example.com', phoneNumber: '0987654321',
          streetAddress: '456 Oak Ave', city: 'Los Angeles', state: 'CA', postalCode: '90001', country: 'USA',
          product: p1.name, productId: p1._id,
          quantity: 2, unitPrice: p1.price, totalAmount: p1.price * 2,
          status: 'In Progress', createdBy: admin._id
        }
      ]);
      console.log('Sample orders seeded successfully');
    } else {
      console.log('Orders already exist or admin not found');
    }
  } catch (err) {
    console.error('Error during startup/seeding:', err);
    throw err;
  }

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/dashboards', dashboardRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/analytics', analyticsRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
  });

  app.use(errorHandler);

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
