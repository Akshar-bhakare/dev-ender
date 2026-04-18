import { Types } from 'mongoose';
import { EventReview } from './reviews.schema.js';
import { EventModel } from '../events/events.schema.js';
import { EventRegistration } from '../registrations/registrations.schema.js';
import { EventError, ERROR_CODES } from '../events/events.errors.js';

export const submitReview = async (eventId: string, userId: string, rating: number, reviewText?: string) => {
  const event = await EventModel.findById(eventId);
  if (!event) throw new EventError(ERROR_CODES.NOT_FOUND, 'Event not found');
  if (event.status !== 'completed') throw new EventError(ERROR_CODES.REVIEW_NOT_ELIGIBLE, 'Event must be completed to leave a review');

  const registration = await EventRegistration.findOne({ eventId: new Types.ObjectId(eventId), userId: new Types.ObjectId(userId) });
  if (!registration || registration.status !== 'attended') {
    throw new EventError(ERROR_CODES.REVIEW_NOT_ELIGIBLE, 'You must have attended the event to leave a review');
  }

  const existingReview = await EventReview.findOne({ eventId: new Types.ObjectId(eventId), userId: new Types.ObjectId(userId) });
  if (existingReview) throw new EventError(ERROR_CODES.DUPLICATE_REVIEW, 'You have already reviewed this event');

  const review = new EventReview({
    eventId: new Types.ObjectId(eventId),
    userId: new Types.ObjectId(userId),
    rating,
    review: reviewText,
  });

  await review.save();

  // Recompute Event rating
  const stats = await EventReview.aggregate([
    { $match: { eventId: new Types.ObjectId(eventId) } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  if (stats.length > 0) {
    event.averageRating = Math.round(stats[0].avgRating * 10) / 10;
    event.reviewCount = stats[0].count;
    await event.save();
  }

  return review;
};

export const getEventReviews = async (eventId: string, page = 1, limit = 10) => {
  const skip = (Number(page) - 1) * Number(limit);
  
  const reviews = await EventReview.find({ eventId: new Types.ObjectId(eventId) })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate('userId', 'name avatar') // Assuming user has name and avatar
    .lean();

  const total = await EventReview.countDocuments({ eventId: new Types.ObjectId(eventId) });

  return { reviews, total, page: Number(page), limit: Number(limit) };
};
