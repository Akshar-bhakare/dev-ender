import dotenv from 'dotenv';
dotenv.config();

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { connectDB } from './config/db.js';
import { jobsRoutes } from './modules/jobs/jobs.routes.js';
import { marketplaceRoutes } from './modules/marketplace/marketplace.routes.js';
import { paymentsRoutes } from './modules/payments/payments.routes.js';
import fastifyRawBody from 'fastify-raw-body';
import util from 'node:util';

// Better error reporting for Node 22 ESM
process.on('unhandledRejection', (reason) => {
  console.error('CRITICAL: Unhandled Rejection at:', util.inspect(reason, { depth: null, colors: true }));
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('CRITICAL: Uncaught Exception:', util.inspect(err, { depth: null, colors: true }));
  process.exit(1);
});

const fastify = Fastify({ logger: true });

// Register Raw Body (essential for Stripe Webhooks)
fastify.register(fastifyRawBody, {
  global: false, // We only need it for the webhook route
  runFirst: true,
});

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
fastify.register(marketplaceRoutes, { prefix: '/api/v1/marketplace' });
fastify.register(paymentsRoutes, { prefix: '/api/v1/payments' });

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
