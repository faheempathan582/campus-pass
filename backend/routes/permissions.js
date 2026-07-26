const express = require('express');
const router = express.Router();
const Permission = require('../models/Permission');
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/auth');

/* ─────────────────────────────────────────────────────────────
   POST /api/permissions
   Create a new permission request (Student only)
───────────────────────────────────────────────────────────── */
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Student') {
      return res.status(403).json({ message: 'Only students can submit permission requests' });
    }

    const { type, reason, fromDate, toDate } = req.body;

    if (!type || !reason || !fromDate || !toDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Determine first authority to notify
    const firstRole = type === 'Hostel Exit' ? 'Warden' : 'Advisor';

    const permission = new Permission({
      student: req.user.id,
      type,
      reason,
      fromDate,
      toDate,
      pendingWithRole: firstRole,
    });
    await permission.save();

    // Notify first authority (Advisor or Warden)
    const student = await User.findById(req.user.id).select('name rollNumber');
    await Notification.create({
      recipientRole: firstRole,
      message: `📋 New ${type} request from ${student?.name || 'a student'}${
        student?.rollNumber ? ` (${student.rollNumber})` : ''
      }. Please review.`,
      permission: permission._id,
    });

    res.status(201).json(permission);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────
   GET /api/permissions/my-requests
   All requests by the current student
───────────────────────────────────────────────────────────── */
router.get('/my-requests', auth, async (req, res) => {
  try {
    const permissions = await Permission.find({ student: req.user.id }).sort({ createdAt: -1 });
    res.json(permissions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/* ─────────────────────────────────────────────────────────────
   GET /api/permissions/pending
   Pending requests for the current authority role
───────────────────────────────────────────────────────────── */
router.get('/pending', auth, async (req, res) => {
  try {
    const AUTHORITY_ROLES = ['Advisor', 'HOD', 'Warden', 'Principal'];
    if (!AUTHORITY_ROLES.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const permissions = await Permission.find({
      pendingWithRole: req.user.role,
      status: 'Pending',
    })
      .populate('student', 'name rollNumber department')
      .sort({ createdAt: -1 });

    res.json(permissions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/* ─────────────────────────────────────────────────────────────
   PUT /api/permissions/:id/action
   Approve or Reject a request
   Approval workflow: Advisor → HOD → Approved
                      Warden → Approved (hostel exits)
───────────────────────────────────────────────────────────── */
router.put('/:id/action', auth, async (req, res) => {
  try {
    const AUTHORITY_ROLES = ['Advisor', 'HOD', 'Warden', 'Principal'];
    if (!AUTHORITY_ROLES.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { action, comment } = req.body; // action: 'Approved' | 'Rejected'

    if (!['Approved', 'Rejected'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const permission = await Permission.findById(req.params.id);
    if (!permission) return res.status(404).json({ message: 'Permission not found' });

    // Ensure this authority role is the one it's pending with
    if (permission.pendingWithRole !== req.user.role) {
      return res.status(403).json({ message: 'This request is not pending with your role' });
    }

    // Record the remark
    permission.remarks.push({
      authority: req.user.id,
      role:      req.user.role,
      comment:   comment || '',
      action,
    });

    if (action === 'Rejected') {
      /* ── Rejected ── */
      permission.status = 'Rejected';
      permission.pendingWithRole = null;

    } else {
      /* ── Approved — determine next step in workflow ── */
      if (req.user.role === 'Advisor') {
        // Advisor → forward to HOD
        permission.pendingWithRole = 'HOD';

        // Notify HOD
        const student = await User.findById(permission.student).select('name rollNumber');
        await Notification.create({
          recipientRole: 'HOD',
          message: `📋 ${permission.type} request from ${student?.name || 'a student'}${
            student?.rollNumber ? ` (${student.rollNumber})` : ''
          } has been approved by Advisor — awaiting your review.`,
          permission: permission._id,
        });

      } else {
        // HOD / Warden / Principal → fully approved
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
