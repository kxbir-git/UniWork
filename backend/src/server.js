require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const seedData = require('./utils/seeder');

// Route imports
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const proposalRoutes = require('./routes/proposalRoutes');
const contractRoutes = require('./routes/contractRoutes');
const walletRoutes = require('./routes/walletRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*', // Allow React Native Web and Mobile requests
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'UniWork MERN Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server & Connect to DB
const startServer = async () => {
  try {
    await connectDB();
    await seedData();

    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 UniWork MERN Backend running on port ${PORT}`);
      console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();
