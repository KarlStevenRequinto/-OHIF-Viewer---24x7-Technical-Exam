/**
 * OHIF Dental Backend Server
 * Express.js server with JWT authentication and state persistence
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { initializeDatabase } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const measurementsRoutes = require('./routes/measurementsRoutes');
const viewerStateRoutes = require('./routes/viewerStateRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Request Logging Middleware (simple)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'OHIF Dental Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/measurements', measurementsRoutes);
app.use('/api/viewer-state', viewerStateRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'OHIF Dental Backend API',
    version: '1.0.0',
    description: 'Backend API for OHIF Dental Viewer with authentication and state persistence',
    endpoints: {
      health: '/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (requires token)'
      },
      measurements: {
        getAll: 'GET /api/measurements (requires token)',
        create: 'POST /api/measurements (requires token)',
        bulkCreate: 'POST /api/measurements/bulk (requires token)',
        delete: 'DELETE /api/measurements/:id (requires token)',
        deleteStudy: 'DELETE /api/measurements/study/:studyInstanceUID (requires token)'
      },
      viewerState: {
        get: 'GET /api/viewer-state (requires token)',
        save: 'POST /api/viewer-state (requires token)',
        delete: 'DELETE /api/viewer-state (requires token)'
      }
    },
    documentation: 'See README.md for detailed API documentation'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

// Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Initialize Database and Start Server
function startServer() {
  try {
    // Initialize database
    console.log('🔧 Initializing database...');
    initializeDatabase();

    // Start server
    app.listen(PORT, () => {
      console.log('');
      console.log('🦷 ============================================');
      console.log('🦷   OHIF Dental Backend Server Started');
      console.log('🦷 ============================================');
      console.log('');
      console.log(`   🌐 Server URL: http://localhost:${PORT}`);
      console.log(`   📊 Health Check: http://localhost:${PORT}/health`);
      console.log(`   📚 API Docs: http://localhost:${PORT}/`);
      console.log(`   🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   🔗 CORS Enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log('');
      console.log('   📝 API Endpoints:');
      console.log('      POST   /api/auth/register');
      console.log('      POST   /api/auth/login');
      console.log('      GET    /api/auth/me');
      console.log('      GET    /api/measurements');
      console.log('      POST   /api/measurements');
      console.log('      POST   /api/measurements/bulk');
      console.log('      DELETE /api/measurements/:id');
      console.log('      GET    /api/viewer-state');
      console.log('      POST   /api/viewer-state');
      console.log('      DELETE /api/viewer-state');
      console.log('');
      console.log('🦷 ============================================');
      console.log('✅ Ready to accept connections!');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
