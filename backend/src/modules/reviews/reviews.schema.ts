import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEventReview extends Document {
  eventId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventReviewSchema = new Schema<IEventReview>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, maxlength: 1000 },
  },
  { timestamps: true }
);

EventReviewSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export const EventReview = mongoose.model<IEventReview>('EventReview', EventReviewSchema);

export interface IEventView extends Document {
  eventId: Types.ObjectId;
  viewerUserId?: Types.ObjectId;
  viewedAt: Date;
  source: 'feed' | 'search' | 'direct' | 'recommendation' | 'promotion';
}

const EventViewSchema = new Schema<IEventView>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    viewerUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    viewedAt: { type: Date, required: true, default: Date.now },
    source: {
      type: String,
      enum: ['feed', 'search', 'direct', 'recommendation', 'promotion'],
      required: true,
    },
  },
  { timestamps: false } // Only viewedAt is needed
);

EventViewSchema.index({ eventId: 1, viewedAt: -1 });

export const EventView = mongoose.model<IEventView>('EventView', EventViewSchema);
