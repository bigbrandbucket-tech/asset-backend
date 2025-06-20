const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const Alert = require('./models/alert');
const Asset = require('./models/asset');

require('dotenv').config();

// Routes
const clientRoutes = require('./routes/clientRoutes');
const projectRoutes = require('./routes/projectRoutes');
const userRoutes = require('./routes/userRoutes');
const assetRoutes = require('./routes/assetRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const alertRoutes = require('./routes/alertRoutes');



const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (images, PDFs etc.)
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/dashboard', dashboardRoutes); // ✅ Register new dashboard route
app.use('/api/alerts', alertRoutes);
// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection failed:', err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
app.get('/', (req, res) => {
  res.send('✅ Backend is running!');
});

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
