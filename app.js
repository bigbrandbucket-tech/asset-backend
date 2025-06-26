const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const dotenv = require('dotenv');
const Alert = require('./models/alert');
const Asset = require('./models/asset');
const User = require('./models/user');
const Client = require('./models/client');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['https://asset-frontend-navy.vercel.app'], // ✅ This must match your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));


app.use(express.json());
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/assets', require('./routes/assetRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));

app.get('/', (req, res) => {
  res.send('✅ Backend is running!');
});

// 🔐 SEED DEFAULT ADMIN & CLIENT
const seedInitialAccounts = async () => {
  try {
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (!existingAdmin) {
      await User.create({
        username: 'admin',
        password: 'admin123',
        role: 'Admin',
        email: 'admin@example.com',
        phone: '9999999999'
      });
      console.log('✅ Default admin user created: admin / admin123');
    }

    const existingClient = await Client.findOne({ username: 'client' });
    if (!existingClient) {
      await Client.create({
        clientName: 'Test Client',
        username: 'client',
        password: 'client123',
        pocName: 'John Doe',
        pocNumber: '8888888888',
        email: 'client@example.com',
        address: '123 Client St'
      });
      console.log('✅ Default client created: client / client123');
    }
  } catch (err) {
    console.error('❌ Error seeding initial users:', err.message);
  }
};

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    seedInitialAccounts(); // 🔑 Seed test login
  })
  .catch((err) => console.error('❌ MongoDB connection failed:', err));

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// ⏰ Cron job
cron.schedule('1 0 * * *', async () => {
  try {
    console.log('🛠️ Running daily expiry alert check...');
    const assets = await Asset.find();
    const now = new Date();

    for (const asset of assets) {
      const daysLeft = (new Date(asset.warrantyExpiryDate) - now) / (1000 * 60 * 60 * 24);

      if (daysLeft <= 30 && !asset.alertRaised) {
        const alert = new Alert({
          asset: asset._id,
          message: `Warranty expiring on ${new Date(asset.warrantyExpiryDate).toDateString()}`
        });
        await alert.save();
        await Asset.findByIdAndUpdate(asset._id, { alertRaised: true });
      }
    }

    console.log('✅ Expiry alerts generated (if any)');
  } catch (err) {
    console.error('❌ Cron job error:', err);
  }
});
