import { createApp } from './app.js';
import { config } from './config/env.js';
import { prisma } from './prisma/client.js';

const app = createApp();

const server = app.listen(config.port, config.host, () => {
  console.log('================================================================');
  console.log(`🚀 Offer Letter Generator API Server running`);
  console.log(`📍 Endpoint: http://${config.host}:${config.port}`);
  console.log(`🌍 Environment: ${config.env}`);
  console.log(`🤖 AI Provider: ${config.ai.provider} (Model: ${config.ai.model})`);
  console.log('================================================================');
});

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  console.log(`\n[SHUTDOWN] Received ${signal}. Closing HTTP server and database connections...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log('[SHUTDOWN] Database connection disconnected cleanly.');
      process.exit(0);
    } catch (err) {
      console.error('[SHUTDOWN_ERROR] Error disconnecting database:', err);
      process.exit(1);
    }
  });

  // Force exit after 10s if hung
  setTimeout(() => {
    console.error('[SHUTDOWN] Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
