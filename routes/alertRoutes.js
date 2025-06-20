const express = require('express');
const router = express.Router();
const Alert = require('../models/alert');
const Asset = require('../models/asset');


// ✅ GET all alerts with asset details
router.get('/', async (req, res) => {
  try {
    const alerts = await Alert.find().populate('asset');
    res.json(alerts);
  } catch (err) {
    console.error("Error fetching alerts:", err);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

// ✅ GET alert count
router.get('/count', async (req, res) => {
  try {
    const count = await Alert.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error("Error counting alerts:", err);
    res.status(500).json({ error: "Failed to get alert count" });
  }
});

// ✅ POST: Generate alerts for assets with ≤30 days left
router.post('/generate-expiry-alerts', async (req, res) => {
  try {
    const assets = await Asset.find();
    const now = new Date();

    for (const asset of assets) {
      const expiry = new Date(asset.warrantyExpiryDate);
      const daysLeft = (expiry - now) / (1000 * 60 * 60 * 24);

      if (daysLeft <= 30 && !asset.alertRaised) {
        // Create alert
        const alert = new Alert({
          asset: asset._id,
          message: `Warranty expiring on ${expiry.toDateString()}`,
        });
        await alert.save();

        // Mark asset to avoid duplicate alerts
        await Asset.findByIdAndUpdate(asset._id, { alertRaised: true });
      }
    }

    res.status(200).json({ message: 'Expiry alerts generated successfully' });
  } catch (error) {
    console.error("Error generating expiry alerts:", error);
    res.status(500).json({ error: "Failed to generate expiry alerts" });
  }
});

module.exports = router;
