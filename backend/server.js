const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRouter = require('./api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Mount API routes
app.use('/api', apiRouter);

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '..', 'build');
  app.use(express.static(buildPath));
  
  // Handle React Router - send all non-API routes to index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  // Health check for root in development
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Rocket League Backend Server', 
      status: 'running',
      timestamp: new Date().toISOString()
    });
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler for API routes only in development
if (process.env.NODE_ENV !== 'production') {
  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Route not found',
      message: `The route ${req.originalUrl} does not exist`,
      timestamp: new Date().toISOString()
    });
  });
}

// For Vercel serverless function
if (process.env.VERCEL) {
  module.exports = app;
} else {
  // For local development
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}