const express = require('express');
const router = express.Router();
const Permission = require('../models/Permission');
const auth = require('../middleware/auth');

// Create a new permission request (Student)
router.post('/', auth, async (req, res) => {
  try {
    const { type, reason, fromDate, toDate } = req.body;
    const permission = new Permission({
      student: req.user.id,
      type,
      reason,
      fromDate,
      toDate,
      pendingWithRole: type === 'Hostel Exit' ? 'Warden' : 'Advisor'
    });
    await permission.save();
    res.status(201).json(permission);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all permissions for a student
router.get('/my-requests', auth, async (req, res) => {
  try {
    const permissions = await Permission.find({ student: req.user.id }).sort({ createdAt: -1 });
    res.json(permissions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending requests for an authority
router.get('/pending', auth, async (req, res) => {
  try {
    // Basic logic: return requests pending with the current user's role
    const permissions = await Permission.find({ 
      pendingWithRole: req.user.role,
      status: 'Pending'
    }).populate('student', 'name rollNumber department').sort({ createdAt: -1 });
    res.json(permissions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/Reject a request
router.put('/:id/action', auth, async (req, res) => {
  try {
    const { action, comment } = req.body; // action: 'Approved' or 'Rejected'
    const permission = await Permission.findById(req.params.id);
    
    if (!permission) return res.status(404).json({ message: 'Not found' });

    permission.remarks.push({
      authority: req.user.id,
      role: req.user.role,
      comment,
      action
    });

    if (action === 'Rejected') {
      permission.status = 'Rejected';
    } else {
      // Very simple workflow for demo: Advisor -> HOD -> Approved
      if (req.user.role === 'Advisor') {
        permission.pendingWithRole = 'HOD';
      } else {
        permission.status = 'Approved';
        permission.pendingWithRole = null;
      }
    }

    await permission.save();
    res.json(permission);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
