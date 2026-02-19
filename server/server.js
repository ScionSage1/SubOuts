const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { errorHandler } = require('./middleware/errorHandler');
const { getPool } = require('./config/database');

// Import routes
const suboutsRoutes = require('./routes/subouts');
const itemsRoutes = require('./routes/items');
const palletsRoutes = require('./routes/pallets');
const loadsRoutes = require('./routes/loads');
const vendorsRoutes = require('./routes/vendors');
const jobsRoutes = require('./routes/jobs');
const cutlistsRoutes = require('./routes/cutlists');
const dashboardRoutes = require('./routes/dashboard');
const communicationsRoutes = require('./routes/communications');
const configRoutes = require('./routes/config');
const teklaRoutes = require('./routes/tekla');
const activityRoutes = require('./routes/activity');

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3004',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/subouts', suboutsRoutes);
app.use('/api/subouts', itemsRoutes);
app.use('/api/subouts', palletsRoutes);
app.use('/api/subouts', loadsRoutes);
app.use('/api/vendors', vendorsRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/cutlists', cutlistsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/communications', communicationsRoutes);
app.use('/api/config', configRoutes);
app.use('/api/tekla', teklaRoutes);
app.use('/api/subouts', activityRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SubOuts API is running', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Test database connection
    await getPool();
    console.log('Database connection established');

    app.listen(PORT, () => {
      console.log(`SubOuts server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
