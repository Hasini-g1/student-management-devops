const app = require('./app');
const { ensureDataFile } = require('./utils/fileStorage');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

async function startServer() {
  try {
    // Ensure initial storage exists
    await ensureDataFile();

    const server = app.listen(PORT, HOST, () => {
      console.log('====================================================');
      console.log('🎓 College DevOps Project: Student Management System');
      console.log(`🚀 Server listening on: http://localhost:${PORT}`);
      console.log(`🩺 Health check URL:   http://localhost:${PORT}/health`);
      console.log(`📊 API endpoints:       http://localhost:${PORT}/api/students`);
      console.log(`🌐 Environment:        ${process.env.NODE_ENV || 'development'}`);
      console.log('====================================================');
    });

    // Graceful shutdown handling (critical for Docker & Kubernetes)
    const handleShutdown = (signal) => {
      console.log(`\n[${signal}] Received termination signal. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed. Exiting process.');
        process.exit(0);
      });

      // Force close if graceful shutdown hangs
      setTimeout(() => {
        console.error('Forced shutdown due to timeout.');
        process.exit(1);
      }, 5000);
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));

  } catch (err) {
    console.error('Failed to initialize server:', err);
    process.exit(1);
  }
}

startServer();
