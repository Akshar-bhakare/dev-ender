import { Types } from 'mongoose';
import { EventModel, IEvent } from './events.schema.js';
import { EventError, ERROR_CODES } from './events.errors.js';

const generateSlug = (title: string): string => {
  const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${randomStr}`;
};

export const createEvent = async (data: Partial<IEvent>, userId: string, companyId?: string) => {
  const isPaid = !data.isFree;
  const requiresReview = isPaid && (data.maxAttendees ?? 0) > 50;

  const event = new EventModel({
    ...data,
    organizerUserId: new Types.ObjectId(userId),
    organizerCompanyId: companyId ? new Types.ObjectId(companyId) : undefined,
    slug: generateSlug(data.title as string),
    status: 'draft',
    requiresAdminReview: requiresReview,
  });

  await event.save();
  return event;
};

export const updateEvent = async (eventId: string, userId: string, data: Partial<IEvent>) => {
  const event = await EventModel.findById(eventId);
  if (!event) throw new EventError(ERROR_CODES.NOT_FOUND, 'Event not found');
  if ((event.organizerUserId?.toString() ?? '') !== userId) throw new EventError(ERROR_CODES.UNAUTHORIZED, 'Not authorized');
  if (event.status !== 'draft') throw new EventError(ERROR_CODES.UNAUTHORIZED, 'Can only update draft events');

  Object.assign(event, data);
  
  if (!event.isFree && (event.maxAttendees ?? 0) > 50) {
    event.requiresAdminReview = true;
  } else {
    event.requiresAdminReview = false;
  }

  await event.save();
  return event;
};

export const publishEvent = async (eventId: string, userId: string) => {
  const event = await EventModel.findById(eventId);
  if (!event) throw new EventError(ERROR_CODES.NOT_FOUND, 'Event not found');
  if ((event.organizerUserId?.toString() ?? '') !== userId) throw new EventError(ERROR_CODES.UNAUTHORIZED, 'Not authorized');
  if (event.status !== 'draft') throw new EventError(ERROR_CODES.UNAUTHORIZED, 'Event is already published or cancelled');

  if (event.requiresAdminReview) {
    throw new EventError(ERROR_CODES.ADMIN_REVIEW_REQUIRED, 'Admin approval is needed before publishing this paid event.');
  }

  event.status = 'published';
  await event.save();
  return event;
};

export const completeEvent = async (eventId: string, userId: string) => {
  const event = await EventModel.findById(eventId);
  if (!event) throw new EventError(ERROR_CODES.NOT_FOUND, 'Event not found');
  if ((event.organizerUserId?.toString() ?? '') !== userId) throw new EventError(ERROR_CODES.UNAUTHORIZED, 'Not authorized');
  
  if (!['published', 'ongoing'].includes(event.status)) {
    throw new EventError(ERROR_CODES.UNAUTHORIZED, 'Event must be published or ongoing to be completed');
  }

  if (event.endDateTime && new Date() < new Date(event.endDateTime)) {
    throw new EventError(ERROR_CODES.VALIDATION_ERROR, 'Cannot complete event before its end time');
  }

  event.status = 'completed';
  await event.save();

  // Escrow update will be triggered organically from controller or event bus.
  // For the hackathon, we'll expose a function in registrations service to handle it.
  
  return event;
};

export const cancelEvent = async (eventId: string, userId: string, reason: string) => {
  const event = await EventModel.findById(eventId);
  if (!event) throw new EventError(ERROR_CODES.NOT_FOUND, 'Event not found');
  if ((event.organizerUserId?.toString() ?? '') !== userId) throw new EventError(ERROR_CODES.UNAUTHORIZED, 'Not authorized');
  if (event.status === 'cancelled') throw new EventError(ERROR_CODES.ALREADY_CANCELLED, 'Event already cancelled');

  event.status = 'cancelled';
  event.cancelledAt = new Date();
  event.cancellationReason = reason;
  await event.save();

  return event;
};

export const searchEvents = async (query: any) => {
  const { q, categoryId, eventType, mode, city, isFree, dateFrom, dateTo, page = 1, limit = 20 } = query;
  
  const filter: any = { status: 'published' };
  
  // registrationDeadline check: Exclude if deadline has passed
  filter.$or = [
    { registrationDeadline: { $exists: false } },
    { registrationDeadline: { $gte: new Date() } }
  ];

  if (q) {
    filter.$text = { $search: q };
  }
  if (categoryId) filter.categoryId = new Types.ObjectId(categoryId);
  if (eventType) filter.eventType = eventType;
  if (mode) filter.mode = mode;
  if (city) filter['location.city'] = new RegExp(city, 'i');
  if (isFree !== undefined) filter.isFree = isFree;
  
  if (dateFrom || dateTo) {
    filter.startDateTime = {};
    if (dateFrom) filter.startDateTime.$gte = new Date(dateFrom);
    if (dateTo) filter.startDateTime.$lte = new Date(dateTo);
  }

  const skip = (Number(page) - 1) * Number(limit);
  
  const events = await EventModel.find(filter)
    .sort({ isBoosted: -1, startDateTime: 1 })
    .skip(skip)
    .limit(Number(limit))
    .select('-description -virtualLink -mediaGallery') // keep it light
    .lean();

  const total = await EventModel.countDocuments(filter);

  return { events, total, page: Number(page), limit: Number(limit) };
};

export const getEventBySlugOrId = async (identifier: string) => {
  const event = await EventModel.findOne({
    $or: [{ slug: identifier }, { _id: Types.ObjectId.isValid(identifier) ? new Types.ObjectId(identifier) : null }]
  }).lean();

  if (!event) throw new EventError(ERROR_CODES.NOT_FOUND, 'Event not found');
  
  return event;
};

export const boostEvent = async (eventId: string, userId: string, boostedUntil: Date) => {
  const event = await EventModel.findById(eventId);
  if (!event) throw new EventError(ERROR_CODES.NOT_FOUND, 'Event not found');
  if ((event.organizerUserId?.toString() ?? '') !== userId) throw new EventError(ERROR_CODES.UNAUTHORIZED, 'Not authorized');

  event.isBoosted = true;
  event.boostedUntil = boostedUntil;
  await event.save();
  return event;
};
