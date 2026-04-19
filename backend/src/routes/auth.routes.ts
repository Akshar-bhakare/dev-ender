import { FastifyInstance } from 'fastify';
import * as AuthController from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export default async function authRoutes(fastify: FastifyInstance) {
  // Shared
  fastify.post('/auth/check-type', AuthController.checkType);
  fastify.post('/auth/login', AuthController.login);
  fastify.post('/auth/refresh', AuthController.refresh);
  fastify.post('/auth/logout', { preHandler: [requireAuth] }, AuthController.logout);
  fastify.post('/auth/forgot-password', AuthController.forgotPassword);
  fastify.post('/auth/reset-password', AuthController.resetPassword);
  fastify.get('/auth/me', { preHandler: [requireAuth] }, AuthController.getMe);

  // User Signup Flow
  fastify.post('/auth/user/step1', AuthController.userStep1);
  fastify.post('/auth/user/step2/verify-otp', { preHandler: [requireAuth] }, AuthController.userStep2VerifyOtp);
  fastify.post('/auth/user/step3/professional-details', { preHandler: [requireAuth] }, AuthController.userStep3ProfessionalDetails);
  fastify.post('/auth/user/step4/face-verify', { preHandler: [requireAuth] }, AuthController.userStep4FaceVerify);
  fastify.post('/auth/user/step5/document-verify', { preHandler: [requireAuth] }, AuthController.userStep5DocumentVerify);
  fastify.post('/auth/user/complete', { preHandler: [requireAuth] }, AuthController.userComplete);

  // Company Signup Flow
  fastify.post('/auth/company/step1', AuthController.companyStep1);
  fastify.post('/auth/company/step2/verify-otp', { preHandler: [requireAuth] }, AuthController.companyStep2VerifyOtp);
  fastify.post('/auth/company/step3/details', { preHandler: [requireAuth] }, AuthController.companyStep3BasicInfo);
  fastify.post('/auth/company/step4/industry', { preHandler: [requireAuth] }, AuthController.companyStep4DetailedInfo);
  fastify.post('/auth/company/step5/identity', { preHandler: [requireAuth] }, AuthController.companyStep5Identity);
  fastify.post('/auth/company/step5/documents', { preHandler: [requireAuth] }, AuthController.companyStep5Documents);
  fastify.post('/auth/company/step6/ownership', { preHandler: [requireAuth] }, AuthController.companyStep6Ownership);

  // External Webhooks
  fastify.post('/auth/onfido/webhook', AuthController.onfidoWebhook);

  // Profile Verification (Sahil's Flow)
  fastify.post('/auth/verify-face', { preHandler: [requireAuth] }, AuthController.verifyFace);
  fastify.post('/auth/verify-doc', { preHandler: [requireAuth] }, AuthController.verifyDoc);
}
