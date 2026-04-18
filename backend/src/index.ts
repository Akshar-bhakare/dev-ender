import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { jobsRoutes } from './modules/jobs/jobs.routes.js';

dotenv.config();

const fastify = Fastify({ logger: true });

// Register CORS
fastify.register(cors, {
  origin: process.env.FRONTEND_URL || '*',
});

// Health check
fastify.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
}));

// ── Register feature modules ──────────────────────────────────
fastify.register(jobsRoutes, { prefix: '/api/v1/jobs' });

// Start the server
const start = async () => {
  try {
    await connectDB();
    const port = parseInt(process.env.PORT || '3001');
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server listening on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
