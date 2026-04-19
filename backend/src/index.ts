import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyRawBody from 'fastify-raw-body';
import util from 'node:util';

// Config & Middleware
import { connectDB } from './config/db.js';
import { requireAuth } from './middleware/auth.middleware.js';

// Feature Routes
import { jobsRoutes } from './modules/jobs/jobs.routes.js';
import { marketplaceRoutes } from './modules/marketplace/marketplace.routes.js';
import { paymentsRoutes } from './modules/payments/payments.routes.js';
import trustRoutes from './modules/trust/trust.routes.js';
import { eventsRoutes } from './modules/events/events.routes.js';
import { fundingRoutes } from './modules/funding/funding.routes.js';
import { registrationsRoutes } from './modules/registrations/registrations.routes.js';
import { reviewsRoutes } from './modules/reviews/reviews.routes.js';

import authRoutes from './routes/auth.routes.js';
import devRoutes from './routes/dev.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import postRoutes from './routes/post.routes.js';
import userRoutes from './routes/user.routes.js';
import companyInviteRoutes from './routes/company-invite.routes.js';

// Better error reporting for Node 22 ESM
process.on('unhandledRejection', (reason) => {
  console.error('CRITICAL: Unhandled Rejection at:', util.inspect(reason, { depth: null, colors: true }));
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('CRITICAL: Uncaught Exception:', util.inspect(err, { depth: null, colors: true }));
  process.exit(1);
});

const fastify = Fastify({ 
  logger: {
    transport: {
      target: 'pino-pretty'
    }
  } 
});

// Register Raw Body (essential for Stripe Webhooks)
fastify.register(fastifyRawBody, {
  global: false, 
  runFirst: true,
});

// Register Multipart plugin for file uploads
fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
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

// Register feature modules
fastify.register(jobsRoutes, { prefix: '/api/v1/jobs' });
fastify.register(marketplaceRoutes, { prefix: '/api/v1/marketplace' });
fastify.register(paymentsRoutes, { prefix: '/api/v1/payments' });
fastify.register(trustRoutes, { prefix: '/api/v1/trust' });
fastify.register(eventsRoutes, { prefix: '/api/v1/events' });
fastify.register(fundingRoutes, { prefix: '/api/v1/funding' });
fastify.register(registrationsRoutes, { prefix: '/api/v1/events' }); // Note: registrations and reviews both under /events in main
fastify.register(reviewsRoutes, { prefix: '/api/v1/events' });

fastify.register(authRoutes, { prefix: '/api/v1' });
fastify.register(devRoutes, { prefix: '/api/v1' });
fastify.register(adminRoutes, { prefix: '/api/v1' });

fastify.register(postRoutes, { prefix: '/api/v1/posts' });
fastify.register(userRoutes, { prefix: '/api/v1/users' });
fastify.register(companyInviteRoutes, { prefix: '/api/v1/company' });

// Protected test route
fastify.get('/api/test', { preHandler: [requireAuth] }, async (request, reply) => {
  return { message: 'You are authenticated!', accountType: (request as any).accountType, user: (request as any).user || (request as any).company };
});

// Start the server
const start = async () => {
  try {
    // Connect to Database (Non-blocking for server start)
    connectDB();
    
    const port = parseInt(process.env.PORT || '3001');
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server listening on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
