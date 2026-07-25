const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['Leave', 'On-Duty', 'Hostel Exit', 'Medical'], 
    required: true 
  },
  reason: { type: String, required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  // Which role needs to approve it next (e.g., Advisor -> HOD -> Principal)
  pendingWithRole: { type: String, default: 'Advisor' },
  // Keep track of the approval trail
  remarks: [{
    authority: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String },
    comment: { type: String },
    action: { type: String, enum: ['Approved', 'Rejected'] },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Permission', permissionSchema);
