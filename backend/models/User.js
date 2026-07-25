const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Student', 'Advisor', 'HOD', 'Warden', 'Principal'], 
    default: 'Student' 
  },
  // Fields specific to Student
  rollNumber: { type: String },
  department: { type: String },
  isHosteller: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
