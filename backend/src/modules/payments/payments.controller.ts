import { FastifyReply, FastifyRequest } from 'fastify';
import { StripeService } from './stripe.service.js';

export async function createCheckoutSessionHandler(request: FastifyRequest, reply: FastifyReply) {
  const { eventId } = request.body as { eventId: string };
  const userId = request.user?.userId;

  if (!userId) return reply.code(401).send({ error: 'Authentication required' });

  try {
    const url = await StripeService.createCheckoutSession(eventId, userId);
    return reply.send({ url });
  } catch (error: any) {
    return reply.code(400).send({ error: error.message });
  }
}

export async function stripeWebhookHandler(request: FastifyRequest, reply: FastifyReply) {
  const signature = request.headers['stripe-signature'] as string;
  if (!signature) return reply.code(400).send({ error: 'Missing stripe-signature header' });

  try {
    // Note: request.rawBody must be enabled in index.ts
    const payload = (request as any).rawBody; 
    const result = await StripeService.handleWebhook(payload, signature);
    return reply.send(result);
  } catch (error: any) {
    console.error('Webhook Error:', error.message);
    return reply.code(400).send({ error: error.message });
  }
}
