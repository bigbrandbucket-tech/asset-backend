const express = require('express');
const router = express.Router();
const Asset = require('../models/asset');
const upload = require('../middleware/multerSetup');
const QRCode = require('qrcode'); // ✅ Added for QR Code generation

// ✅ POST: Upload Asset + Generate QR Code
router.post(
  '/upload',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'ga', maxCount: 1 },
    { name: 'tds', maxCount: 1 },
    { name: 'spares', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const {
        assetName, type, tag, service, location,
        repPhone, model, makeOrOEM, warrantyExpiryDate
      } = req.body;

      const asset = new Asset({
        assetName,
        type,
        tag,
        service,
        location,
        repPhone,
        model,
        makeOrOEM,
        imageUrl: req.files?.image?.[0]?.path || null,
        gaDocumentUrl: req.files?.ga?.[0]?.path || null,
        tdsDocumentUrl: req.files?.tds?.[0]?.path || null,
        sparesManualsUrl: req.files?.spares?.[0]?.path || null,
        warrantyExpiryDate
      });

      await asset.save();

      // ✅ Generate QR Code with frontend link
      const assetUrl = `https://your-frontend.vercel.app/asset/${asset._id}`;
      const qrCodeDataURL = await QRCode.toDataURL(assetUrl);

      asset.qrCodeUrl = qrCodeDataURL;
      await asset.save();

      res.status(201).json({ message: 'Asset uploaded successfully', asset });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Asset upload failed' });
    }
  }
);

// ✅ GET: Total asset count
router.get('/counts', async (req, res) => {
  try {
    const totalAssets = await Asset.countDocuments();
    const today = new Date();
    const activeAssets = await Asset.countDocuments({
      warrantyExpiryDate: { $gte: today }
    });

    res.json({ totalAssets, activeAssets });
  } catch (error) {
    console.error("Error fetching asset counts:", error);
    res.status(500).json({ error: "Failed to fetch asset counts" });
  }
});

// ✅ GET: Count of assets grouped by type
router.get('/type-count', async (req, res) => {
  try {
    const result = await Asset.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          count: 1
        }
      }
    ]);
    res.json(result);
  } catch (error) {
    console.error("Error fetching asset type counts:", error);
    res.status(500).json({ error: "Failed to fetch asset type counts" });
  }
});

// ✅ GET: All assets
router.get('/', async (req, res) => {
  try {
    const assets = await Asset.find();
    res.json(assets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// ✅ GET: Active assets
router.get('/active', async (req, res) => {
  try {
    const today = new Date();
    const activeAssets = await Asset.find({
      warrantyExpiryDate: { $gte: today }
    });

    res.json(activeAssets);
  } catch (error) {
    console.error("❌ Error fetching active assets:", error);
    res.status(500).json({ error: 'Failed to fetch active assets' });
  }
});

// ✅ GET: Single asset by ID
router.get('/:id', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id).populate('associatedProject');
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    res.json(asset);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch asset' });
  }
});

module.exports = router;
