const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { isValidCollegeEmail } = require('../utils/validateEmail');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretcampuspasskey';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, rollNumber, department, isHosteller } = req.body;

    if (!isValidCollegeEmail(email)) {
      return res.status(400).json({
        message: 'Only @srit.ac.in college email addresses are allowed (e.g. 254g1a4734@srit.ac.in)'
      });
    }

    if (role === 'Student' && (!rollNumber || !department)) {
      return res.status(400).json({ message: 'Roll number and department are required for students' });
    }
    
    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      name,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role,
      rollNumber,
      department,
      isHosteller: isHosteller ?? false
    });
    
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!isValidCollegeEmail(email)) {
      return res.status(400).json({
        message: 'Only @srit.ac.in college email addresses are allowed (e.g. 254g1a4734@srit.ac.in)'
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
