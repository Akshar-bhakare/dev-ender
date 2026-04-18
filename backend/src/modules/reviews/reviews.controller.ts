import { FastifyRequest, FastifyReply } from 'fastify';
import * as ReviewsService from './reviews.service.js';
import { SubmitReviewSchema } from './reviews.validation.js';
import { EventError, ERROR_CODES } from '../events/events.errors.js';

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

export const submitReview = async (request: FastifyRequest, reply: FastifyReply) => {
  const params = request.params as { eventId: string };
  try {
    const data = SubmitReviewSchema.parse(request.body);
    const result = await ReviewsService.submitReview(params.eventId, request.user!.userId, data.rating, data.review);
    return reply.code(201).send({ success: true, data: result });
  } catch (err) {
    return handleError(err, request, reply);
  }
};

export const getReviews = async (request: FastifyRequest, reply: FastifyReply) => {
  const params = request.params as { eventId: string };
  const query = request.query as { page?: string, limit?: string };
  try {
    const result = await ReviewsService.getEventReviews(params.eventId, Number(query.page || 1), Number(query.limit || 10));
    return reply.send({ success: true, data: result });
  } catch (err) {
    return handleError(err, request, reply);
  }
};
