import { FastifyRequest, FastifyReply } from 'fastify';
import * as RegistrationsService from './registrations.service.js';
import { RegisterEventSchema, CreatePromoCodeSchema, CheckInSchema } from './registrations.validation.js';
import { EventError, ERROR_CODES } from '../events/events.errors.js';
import crypto from 'crypto';

const handleError = (error: any, request: FastifyRequest, reply: FastifyReply) => {
  if (error instanceof EventError) {
    return reply.code(error.code === ERROR_CODES.NOT_FOUND ? 404 : 400).send({
      success: false,
      error: { code: error.code, message: error.message },
    });
  }
  
  if (error.name === 'ZodError') {
    return reply.code(400).send({
      success: false,
      error: { code: ERROR_CODES.VALIDATION_ERROR, issues: error.issues },
    });
  }

  request.log.error(error);
  return reply.code(500).send({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
  });
};

export const registerForEvent = async (request: FastifyRequest, reply: FastifyReply) => {
  const params = request.params as { eventId: string };
  try {
    const data = RegisterEventSchema.parse(request.body);
    const result = await RegistrationsService.registerForEvent(
      params.eventId,
      request.user!.userId,
      data.promoCode
    );
    return reply.send({ success: true, data: result });
  } catch (err) {
    return handleError(err, request, reply);
  }
};

export const razorpayWebhook = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const signature = request.headers['x-razorpay-signature'] as string;
    const rawBody = (request as any).rawBody || JSON.stringify(request.body); // Need raw body for HMAC usually, but fastify might parse. Standardize based on Fastify setup.
    // For simplicity, Razorpay verification check handled inside the service or we verify here.
    // Assuming razorpay.ts handles signature verify.
    const { razorpayServer } = await import('../../lib/razorpay.js');
    if (!razorpayServer.verifyWebhookSignature(rawBody, signature, process.env.RAZORPAY_WEBHOOK_SECRET || '')) {
      return reply.code(400).send({ success: false, message: 'Invalid signature' });
    }

    await RegistrationsService.handleRazorpayWebhook(request.body);
    return reply.send({ status: 'ok' });
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({ success: false });
  }
};

export const checkInAttendee = async (request: FastifyRequest, reply: FastifyReply) => {
  const params = request.params as { eventId: string };
  try {
    const data = CheckInSchema.parse(request.body);
    const result = await RegistrationsService.checkInAttendee(data.qrCodeToken, params.eventId, request.user!.userId);
    return reply.send({ success: true, data: result });
  } catch (err) {
    return handleError(err, request, reply);
  }
};

export const createPromoCode = async (request: FastifyRequest, reply: FastifyReply) => {
  const params = request.params as { eventId: string };
  try {
    const data = CreatePromoCodeSchema.parse(request.body);
    const promo = await RegistrationsService.createPromoCode(data, params.eventId, request.user!.userId);
    return reply.send({ success: true, data: promo });
  } catch (err) {
    return handleError(err, request, reply);
  }
};
