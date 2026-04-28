import express from 'express';
import User from '../models/User.js';
import Assignment from '../models/Assignment.js';

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID with assignments
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const assignments = await Assignment.find({
      userId: req.params.id,
      status: { $ne: 'resolved' },
    }).populate('incidentId');

    res.json({
      user,
      assignments,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get users by role
router.get('/role/:role', async (req, res) => {
  try {
    const users = await User.find({ role: req.params.role });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user location
router.patch('/:id/location', async (req, res) => {
  try {
    const { x, y } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { location: { x, y } }, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login (demo)
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      user,
      token: 'demo-token-' + user._id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
