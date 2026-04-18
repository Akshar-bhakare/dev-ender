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

export const calculateRisk = async (request: FastifyRequest, reply: FastifyReply) => {
  const params = request.params as { eventId: string };
  try {
    const event = await EventService.getEventBySlugOrId(params.eventId);
    let organizerTrustScore = event.trustScore || 0; // In a real app we might fetch user/company trustScore here
    
    // Simulate fetching organizer trust score if we need to dynamically calculate
    // const User = mongoose.model('User');
    // const org = await User.findById(event.organizerUserId);
    // organizerTrustScore = org?.trustScore || 0;

    let eventScore = organizerTrustScore;
    eventScore += event.venueVerified ? 10 : -10;
    eventScore += (event.ticketPrice && event.ticketPrice > 2000) ? -10 : 5;

    let decisionStatus = 'pending_approval';
    if (eventScore > 60) decisionStatus = 'published';
    else if (eventScore < 30) decisionStatus = 'blocked';

    event.status = decisionStatus as any;
    
    // Have to bypass the Mongoose validation dynamically by just letting the mock save if needed.
    // Assuming EventService doesn't export save, we'll use findOneAndUpdate directly or via service
    // For demo:
    const { EventModel } = await import('./events.schema.js');
    await EventModel.findByIdAndUpdate(event._id, { status: decisionStatus, trustScore: eventScore });

    return reply.send({
      success: true,
      eventScore,
      decision: decisionStatus
    });
  } catch (err) {
    return handleError(err, request, reply);
  }
};

export const reportEvent = async (request: FastifyRequest, reply: FastifyReply) => {
  const params = request.params as { eventId: string };
  try {
    const event = await EventService.getEventBySlugOrId(params.eventId);
    const { EventModel } = await import('./events.schema.js');
    
    let reportCount = (event.reportCount || 0) + 1;
    let flagged = event.flagged;
    let status = event.status;
    let payoutStatus = event.payoutStatus;

    if (reportCount >= 3) flagged = true;
    if (reportCount >= 10) {
      status = 'hidden' as any;
      payoutStatus = 'FROZEN';
    }

    await EventModel.findByIdAndUpdate(event._id, { 
      reportCount, 
      flagged, 
      status, 
      payoutStatus 
    });

    return reply.send({ success: true, data: { reportCount, flagged, status, payoutStatus } });
  } catch (err) {
    return handleError(err, request, reply);
  }
};

export const getTrustSummary = async (request: FastifyRequest, reply: FastifyReply) => {
  const params = request.params as { eventId: string };
  try {
    const event = await EventService.getEventBySlugOrId(params.eventId);
    // In a real app we query the User/Company to get verified status
    // For demo, we mock or fetch 
    const { User } = await import('../../models/User.js');
    const organizer = await User.findById(event.organizerUserId) as any;
    
    return reply.send({
      success: true,
      data: {
        organizerVerified: organizer?.identityVerified || false,
        pastEvents: organizer?.totalEventsHosted || 0,
        avgRating: organizer?.avgRating || 0,
        venueVerified: event.venueVerified || false,
        escrowProtected: true // Enforced architecture
      }
    });
  } catch (err) {
    return handleError(err, request, reply);
  }
};

export const calculateRefund = async (request: FastifyRequest, reply: FastifyReply) => {
  const params = request.params as { eventId: string };
  try {
    const event = await EventService.getEventBySlugOrId(params.eventId);
    
    const now = new Date();
    const eventDate = new Date(event.startDateTime ?? event.date ?? new Date());
    const diffTime = eventDate.getTime() - now.getTime();
    const daysBeforeEvent = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let refundPercentage = 0;
    if (daysBeforeEvent > 7) {
      refundPercentage = 100;
    } else if (daysBeforeEvent > 3) {
      refundPercentage = 50;
    } else {
      refundPercentage = 0;
    }

    const ticketPrice = event.ticketPrice || 0;
    const refundAmount = (ticketPrice * refundPercentage) / 100;

    return reply.send({
      success: true,
      refundPercentage,
      refundAmount
    });
  } catch (err) {
    return handleError(err, request, reply);
  }
};

