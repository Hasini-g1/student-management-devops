const express = require('express');
const path = require('path');
const studentController = require('./controllers/studentController');

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for debugging & DevOps observability
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../public')));

// Root route serves dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Health check endpoints (root and under /api)
app.get('/health', studentController.getHealth);
app.get('/api/health', studentController.getHealth);

// Dashboard KPI stats
app.get('/api/stats', studentController.getStats);

// Reset database demo endpoint
app.post('/api/reset', studentController.resetData);

// Student REST API CRUD endpoints
app.get('/api/students', studentController.getStudents);
app.get('/api/students/:id', studentController.getStudentById);
app.post('/api/students', studentController.createStudent);
app.put('/api/students/:id', studentController.updateStudent);
app.delete('/api/students/:id', studentController.deleteStudent);

// 404 handler for undefined API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error: ' + err.message
  });
});

module.exports = app;
