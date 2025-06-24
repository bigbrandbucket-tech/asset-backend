const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Asset = require('../models/asset');
const Project = require('../models/project'); // ✅ FIX: Add this import
const upload = require('../middleware/multerSetup');
const generateQrCode = require('../utils/generateQRCode');

// ✅ POST: Upload a new asset
router.post(
  '/upload',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'ga', maxCount: 1 },
    { name: 'curve', maxCount: 1 },
    { name: 'performance', maxCount: 1 },
    { name: 'spares', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const {
        assetName,
        type,
        tag,
        model,
        makeOrOEM,
        warrantyExpiryDate,
        latitude,
        longitude,
        associatedProject
      } = req.body;

      const asset = new Asset({
        assetName,
        type,
        tag,
        model,
        makeOrOEM,
        warrantyExpiryDate,
        associatedProject,
        location: {
          latitude,
          longitude
        },
        imageUrl: req.files?.image?.[0]?.path || null,
        gaDocumentUrl: req.files?.ga?.[0]?.path || null,
        curveDocumentUrl: req.files?.curve?.[0]?.path || null,
        performanceDocumentUrl: req.files?.performance?.[0]?.path || null,
        sparesManualsUrl: req.files?.spares?.[0]?.path || null
      });

      await asset.save();

      // ✅ Link asset to project
      if (associatedProject) {
        await Project.findByIdAndUpdate(
          associatedProject,
          { $push: { assets: asset._id } },
          { new: true }
        );
      }

      const qrCode = await generateQrCode(asset._id);

      res.status(201).json({
        message: 'Asset uploaded successfully',
        asset,
        qrCode
      });
    } catch (err) {
      console.error('🔥 Error uploading asset:', err);
      res.status(500).json({ error: 'Asset upload failed' });
    }
  }
);

// ✅ GET: Total asset and active asset counts
router.get('/counts', async (req, res) => {
  try {
    const totalAssets = await Asset.countDocuments();
    const today = new Date();

    const activeAssets = await Asset.countDocuments({
      warrantyExpiryDate: { $gte: today }
    });

    res.json({ totalAssets, activeAssets });
  } catch (error) {
    console.error('❌ Error fetching asset counts:', error);
    res.status(500).json({ error: 'Failed to fetch asset counts' });
  }
});

// ✅ GET: Count of assets grouped by type
router.get('/type-count', async (req, res) => {
  try {
    const result = await Asset.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          type: '$_id',
          count: 1
        }
      }
    ]);
    res.json(result);
  } catch (error) {
    console.error('❌ Error fetching asset type counts:', error);
    res.status(500).json({ error: 'Failed to fetch asset type counts' });
  }
});

// ✅ GET: All assets
router.get('/', async (req, res) => {
  try {
    const assets = await Asset.find();
    res.json(assets);
  } catch (err) {
    console.error('❌ Error fetching all assets:', err);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// ✅ GET: Active assets (warranty not expired)
router.get('/active', async (req, res) => {
  try {
    const today = new Date();
    const activeAssets = await Asset.find({
      warrantyExpiryDate: { $gte: today }
    });
    res.json(activeAssets);
  } catch (error) {
    console.error('❌ Error fetching active assets:', error);
    res.status(500).json({ error: 'Failed to fetch active assets' });
  }
});

// ✅ GET: Single asset by ID with validation
router.get('/:id', async (req, res) => {
  try {
    const assetId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(assetId)) {
      console.warn('⚠️ Invalid asset ID format:', assetId);
      return res.status(400).json({ error: 'Invalid asset ID' });
    }

    const asset = await Asset.findById(assetId);

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.json(asset);
  } catch (err) {
    console.error('🔥 Error in GET /api/assets/:id:', err);
    res.status(500).json({ error: 'Failed to fetch asset' });
  }
});

module.exports = router;
