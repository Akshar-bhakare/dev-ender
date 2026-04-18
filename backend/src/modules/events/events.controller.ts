import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateEventSchema, UpdateEventSchema, CancelEventSchema, SearchEventsSchema } from './events.validation.js';
import * as EventService from './events.service.js';
import { EventError, ERROR_CODES } from './events.errors.js';
import { handleEventCancellationPayouts } from '../registrations/registrations.service.js';
import { generateUploadSignature } from '../../lib/cloudinary.js';

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

export const createEvent = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const data = CreateEventSchema.parse(request.body) as any;
    const event = await EventService.createEvent(data, request.user!.userId, request.user?.companyId);
    return reply.code(201).send({ success: true, data: event });
  } catch (err) {
    return handleError(err, request, reply);
  }
};

export const updateEvent = async (request: FastifyRequest, reply: FastifyReply) => {
  const params = request.params as { eventId: string };
  try {
    const data = UpdateEventSchema.parse(request.body) as any;
    const event = await EventService.updateEvent(params.eventId, request.user!.userId, data);
    return reply.send({ success: true, data: event });
  } catch (err) {
    return handleError(err, request, reply);
  }
};

export const publishEvent = async (request: FastifyRequest, reply: FastifyReply) => {
  const params = request.params as { eventId: string };
  try {
    const event = await EventService.publishEvent(params.eventId, request.user!.userId);
    return reply.send({ success: true, data: event });
  } catch (err) {
    return handleError(err, request, reply);
  }
};

export const completeEvent = async (request: FastifyRequest, reply: FastifyReply) => {
  const params = request.params as { eventId: string };
  try {
    const event = await EventService.completeEvent(params.eventId, request.user!.userId);
    return reply.send({ success: true, data: event });
  } catch (err) {
    return handleError(err, request, reply);
  }
};

export const cancelEvent = async (request: FastifyRequest, reply: FastifyReply) => {
  const params = request.params as { eventId: string };
  try {
    const data = CancelEventSchema.parse(request.body);
    const event = await EventService.cancelEvent(params.eventId, request.user!.userId, data.cancellationReason);
    await handleEventCancellationPayouts(params.eventId);
    return reply.send({ success: true, data: event });
  } catch (err) {
    return handleError(err, request, reply);
  }
};

export const searchEvents = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const query = SearchEventsSchema.parse(request.query);
    const result = await EventService.searchEvents(query);
    return reply.send({ success: true, data: result });
  } catch (err) {
    return handleError(err, request, reply);
  }
};

export const getEventDetail = async (request: FastifyRequest, reply: FastifyReply) => {
  const params = request.params as { slugOrId: string };
  try {
    const event = await EventService.getEventBySlugOrId(params.slugOrId);
    // TODO: Increment viewCount async
    // TODO: Strip virtualLink if user is not a confirmed attendee
    return reply.send({ success: true, data: event });
  } catch (err) {
    return handleError(err, request, reply);
  }
};

export const getUploadSignature = async (request: FastifyRequest, reply: FastifyReply) => {
  return reply.send({ success: true, data: generateUploadSignature() });
};
