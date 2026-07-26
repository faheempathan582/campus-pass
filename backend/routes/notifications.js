const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const AUTHORITY_ROLES = ['Advisor', 'HOD', 'Warden', 'Principal'];

router.get('/', auth, async (req, res) => {
  try {
    if (!AUTHORITY_ROLES.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const notifications = await Notification.find({ recipientRole: req.user.role })
      .populate('permission', 'type status fromDate toDate')
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

router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Not found' });
    if (notification.recipientRole !== req.user.role) {
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

router.put('/read-all', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientRole: req.user.role,
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
