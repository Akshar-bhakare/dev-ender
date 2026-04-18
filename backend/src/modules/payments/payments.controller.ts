import { FastifyReply, FastifyRequest } from 'fastify';
import { StripeService } from './stripe.service.js';

export async function createCheckoutSessionHandler(request: FastifyRequest, reply: FastifyReply) {
  const { eventId } = request.body as { eventId: string };
  const userId = request.user?.sub;

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

export async function createPayment(request: FastifyRequest, reply: FastifyReply) {
  const { eventId, amount } = request.body as { eventId: string, amount: number };
  const userId = request.user?.sub;

  if (!userId) return reply.code(401).send({ error: 'Authentication required' });

  try {
    const { Payment } = await import('../../models/Payment.js');
    const payment = new Payment({
      eventId,
      userId,
      amount,
      status: 'HELD',
      payoutStatus: 'LOCKED'
    });
    await payment.save();
    return reply.status(201).send({ success: true, data: payment });
  } catch (error: any) {
    return reply.code(400).send({ error: error.message });
  }
}

export async function releasePayout(request: FastifyRequest, reply: FastifyReply) {
  const { paymentId } = request.body as { paymentId: string };
  try {
    const { Payment } = await import('../../models/Payment.js');
    const payment = await Payment.findById(paymentId);
    if (!payment) return reply.status(404).send({ error: 'Payment not found' });

    payment.status = 'RELEASED';
    payment.payoutStatus = 'RELEASED';
    await payment.save();

    return reply.send({ success: true, data: payment });
  } catch (error: any) {
    return reply.code(400).send({ error: error.message });
  }
}

export async function refundPayment(request: FastifyRequest, reply: FastifyReply) {
  const { paymentId } = request.body as { paymentId: string };
  try {
    const { Payment } = await import('../../models/Payment.js');
    const payment = await Payment.findById(paymentId);
    if (!payment) return reply.status(404).send({ error: 'Payment not found' });

    payment.status = 'REFUNDED';
    await payment.save();

    return reply.send({ success: true, data: payment });
  } catch (error: any) {
    return reply.code(400).send({ error: error.message });
  }
}

export async function freezePayout(request: FastifyRequest, reply: FastifyReply) {
  const { paymentId } = request.body as { paymentId: string };
  try {
    const { Payment } = await import('../../models/Payment.js');
    const payment = await Payment.findById(paymentId);
    if (!payment) return reply.status(404).send({ error: 'Payment not found' });

    payment.payoutStatus = 'FROZEN';
    await payment.save();

    return reply.send({ success: true, data: payment });
  } catch (error: any) {
    return reply.code(400).send({ error: error.message });
  }
}

export async function releaseMilestone(request: FastifyRequest, reply: FastifyReply) {
  const { paymentId, percentage } = request.body as { paymentId: string, percentage: number };
  try {
    const { Payment } = await import('../../models/Payment.js');
    const payment = await Payment.findById(paymentId);
    if (!payment) return reply.status(404).send({ error: 'Payment not found' });

    payment.payoutStatus = 'PARTIAL_RELEASED';
    // Logic to handle partial amount release would go here
    await payment.save();

    return reply.send({ success: true, data: payment, releasedPercentage: percentage });
  } catch (error: any) {
    return reply.code(400).send({ error: error.message });
  }
}
