const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Project = require('../models/project'); // ✅ Added

// ✅ Create a new user
router.post('/', async (req, res) => {
  try {
    const { assignedProject } = req.body;

    // Create the user
    const user = await User.create(req.body);

    // If user is assigned to a project, add user to that project's user list
    if (assignedProject) {
      await Project.findByIdAndUpdate(
        assignedProject,
        { $push: { users: user._id } },
        { new: true }
      );
    }

    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Get all users with project and client populated
router.get('/', async (req, res) => {
  try {
    const users = await User.find().populate({
      path: 'assignedProject',
      populate: { path: 'client' }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ✅ Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate({
      path: 'assignedProject',
      populate: { path: 'client' }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ✅ Get users by client name (filtered by nested project->client)
router.get('/by-client/:clientName', async (req, res) => {
  const clientName = req.params.clientName;

  try {
    const users = await User.find()
      .populate({
        path: 'assignedProject',
        populate: {
          path: 'client',
          match: { clientName: clientName }
        }
      });

    const filteredUsers = users.filter(
      user => user.assignedProject && user.assignedProject.client
    );

    res.json(filteredUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users by client name' });
  }
});

module.exports = router;
