import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import postRoutes from './routes/post.routes.js';
import userRoutes from './routes/user.routes.js';
import { authenticate } from './middleware/auth.middleware.js';
import { connectDB } from './config/db.js';
import multipart from '@fastify/multipart';


dotenv.config();



const fastify = Fastify({
  logger: true
});

// Register Multipart plugin for file uploads
fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Register CORS
fastify.register(cors, {
  origin: process.env.FRONTEND_URL || '*'
});

// Register health check route
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(postRoutes, { prefix: '/api/posts' });
fastify.register(userRoutes, { prefix: '/api/users' });

// Protected test route
fastify.get('/api/test', { preHandler: [authenticate] }, async (request, reply) => {
  return { message: 'You are authenticated!', user: (request as any).user };
});

// Start the server
const start = async () => {
  try {
    // Connect to Database (Non-blocking for server start)
    connectDB();
    
    const port = parseInt(process.env.PORT || '3001');
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
