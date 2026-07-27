const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

/* ── GET /api/notifications — Fetch notifications for logged-in user ── */
router.get('/', auth, async (req, res) => {
  try {
    const queryConditions = [];

    if (req.user.id) {
      queryConditions.push({ recipientUser: req.user.id });
    }
    if (req.user.role) {
      queryConditions.push({ recipientRole: req.user.role });
    }

    const notifications = await Notification.find({ $or: queryConditions })
      .populate('permission', 'type status fromDate toDate student')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = notifications.filter(
      (n) => !n.readBy.some((id) => id.toString() === req.user.id)
    ).length;

    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ── PUT /api/notifications/:id/read — Mark single notification as read ── */
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Not found' });

    const isRecipient =
      (notification.recipientUser && notification.recipientUser.toString() === req.user.id) ||
      (notification.recipientRole && notification.recipientRole === req.user.role);

    if (!isRecipient) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const alreadyRead = notification.readBy.some((id) => id.toString() === req.user.id);
    if (!alreadyRead) {
      notification.readBy.push(req.user.id);
      await notification.save();
    }

    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ── PUT /api/notifications/read-all — Mark all notifications as read ── */
router.put('/read-all', auth, async (req, res) => {
  try {
    const queryConditions = [];
    if (req.user.id) queryConditions.push({ recipientUser: req.user.id });
    if (req.user.role) queryConditions.push({ recipientRole: req.user.role });

    const notifications = await Notification.find({
      $or: queryConditions,
      readBy: { $ne: req.user.id }
    });

    await Promise.all(
      notifications.map(async (notification) => {
        if (!notification.readBy.some((id) => id.toString() === req.user.id)) {
          notification.readBy.push(req.user.id);
          await notification.save();
        }
      })
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
