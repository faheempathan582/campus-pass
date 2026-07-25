require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
let MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  if (!MONGODB_URI) {
    console.log('No MONGODB_URI found, starting in-memory MongoDB fallback...');
    const mongoServer = await MongoMemoryServer.create();
    MONGODB_URI = mongoServer.getUri();
  }

  mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));
};

connectDB();

// Routes
const authRoutes = require('./routes/auth');
const permissionRoutes = require('./routes/permissions');
app.use('/api/auth', authRoutes);
app.use('/api/permissions', permissionRoutes);

// Basic Route for testing
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CampusPass API is running!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
