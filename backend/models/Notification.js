const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientRole: {
    type: String,
    enum: ['Advisor', 'HOD', 'Warden', 'Principal'],
    required: true
  },
  message: { type: String, required: true },
  permission: { type: mongoose.Schema.Types.ObjectId, ref: 'Permission' },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
