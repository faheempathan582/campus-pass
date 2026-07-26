require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = express();
const PORT = process.env.PORT || 5000;

/* ── CORS — restrict to your Vercel frontend + local dev ── */
const ALLOWED_ORIGINS = [
  'https://campus-pass-cspy.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));

app.use(express.json());

/* ── Database ── */
let MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  if (!MONGODB_URI) {
    console.log('No MONGODB_URI found, starting in-memory MongoDB fallback...');
    const mongoServer = await MongoMemoryServer.create();
    MONGODB_URI = mongoServer.getUri();
  }
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));
};

connectDB();

/* ── Routes ── */
const authRoutes         = require('./routes/auth');
const permissionRoutes   = require('./routes/permissions');
const notificationRoutes = require('./routes/notifications');

app.use('/api/auth',          authRoutes);
app.use('/api/permissions',   permissionRoutes);
app.use('/api/notifications', notificationRoutes);

/* ── Health check ── */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CampusPass API is running!', timestamp: new Date().toISOString() });
});

/* ── Start ── */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
