
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Routes
const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const prescriptionRoutes = require('./routes/prescriptions');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const patientRoutes = require('./routes/patients');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Initialize MongoDB connection
const initializeDatabase = async () => {
  try {
    console.log('Initializing MongoDB connection...');
    await connectDB();
    console.log('MongoDB connection established successfully');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

// Initialize database before starting server
initializeDatabase().then(() => {
  console.log('NLP Service URL is', process.env.NLP_SERVICE_URL ? 'configured' : 'not configured');

  // API Routes with error handling middleware
  app.use('/api/auth', authRoutes);
  app.use('/api/doctors', doctorRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/prescriptions', prescriptionRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/patients', patientRoutes);

  // Basic route
  app.get('/', (req, res) => {
    res.json({ 
      message: 'MediClinic API is running',
      version: '1.0.0',
      status: 'active'
    });
  });

  // Health check endpoint
  app.get('/health', async (req, res) => {
    try {
      const mongoose = require('mongoose');
      const dbStatus = mongoose.connection.readyState;
      const dbStatusText = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };

      res.status(200).json({ 
        status: 'ok', 
        message: 'MediClinic API is operational',
        mongodb: {
          status: dbStatusText[dbStatus] || 'unknown',
          host: mongoose.connection.host,
          name: mongoose.connection.name
        },
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Health check failed',
        error: error.message
      });
    }
  });

  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      message: 'API endpoint not found',
      path: req.originalUrl,
      method: req.method
    });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('Global error handler:', err.stack);
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        message: 'Validation Error',
        errors
      });
    }
    
    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid ID format',
        error: err.message
      });
    }
    
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid token',
        error: err.message
      });
    }
    
    // Default error response
    res.status(err.status || 500).json({
      message: err.message || 'An unexpected error occurred',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`API available at: http://localhost:${PORT}/api`);
  });
});
