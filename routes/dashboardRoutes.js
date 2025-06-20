// routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();

const Client = require('../models/client');
const Project = require('../models/project');
const User = require('../models/user');
const Asset = require('../models/asset');

// GET: Dashboard Overview Stats
router.get('/overview', async (req, res) => {
  try {
    const [totalClients, totalProjects, totalUsers, totalAssets] = await Promise.all([
      Client.countDocuments(),
      Project.countDocuments(),
      User.countDocuments(),
      Asset.countDocuments(),
    ]);

    res.status(200).json({
      totalClients,
      totalProjects,
      totalUsers,
      totalAssets,
      activeAssets: totalAssets, // assuming all are active for now
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

module.exports = router;
