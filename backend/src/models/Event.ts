import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEventCategory extends Document {
  name: string;
  slug: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventCategorySchema = new Schema<IEventCategory>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    icon: { type: String },
  },
  { timestamps: true }
);

export const EventCategory = mongoose.models.EventCategory || mongoose.model<IEventCategory>('EventCategory', EventCategorySchema);

export interface IEvent extends Document {
  // Legacy fields (from models/Event.ts)
  organizer?: Types.ObjectId;
  organizerModel?: 'User' | 'Company';
  date?: Date;
  locationType?: 'online' | 'physical';
  linkOrAddress?: string;
  price?: number;
  payoutStatus: 'LOCKED' | 'PARTIAL_RELEASED' | 'RELEASED' | 'FROZEN';
  cancellationPolicy: {
    before7Days: string;
    before3Days: string;
    before48Hours: string;
  };

  // Rich fields (from events module schema)
  organizerUserId?: Types.ObjectId;
  organizerCompanyId?: Types.ObjectId;
  title: string;
  slug: string;
  tagline?: string | null;
  description: string;
  bannerImage?: string;
  mediaGallery?: string[];
  categoryId?: Types.ObjectId;
  eventType?: 'hackathon' | 'conference' | 'workshop' | 'networking' | 'startup_showcase' | 'hiring_event' | 'webinar' | 'other';
  tags?: string[];
  mode?: 'in_person' | 'virtual' | 'hybrid';
  location?: {
    venue: string;
    address: string;
    city: string;
    state: string;
    country: string;
    mapLink?: string | null;
  } | null;
  virtualLink?: string | null;
  startDateTime?: Date;
  endDateTime?: Date;
  timezone?: string;
  isFree?: boolean;
  ticketPrice?: number | null;
  currency: string;
  maxAttendees?: number;
  registrationCount?: number;
  waitlistEnabled?: boolean;
  registrationDeadline?: Date | null;
  status: string;
  isBoosted?: boolean;
  boostedUntil?: Date;
  requiresAdminReview?: boolean;
  cancelledAt?: Date;
  cancellationReason?: string;
  averageRating?: number;
  reviewCount?: number;
  viewCount?: number;
  trustScore: number;
  venueVerified: boolean;
  reportCount: number;
  flagged: boolean;
  hidden: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    // Organizer (supports both simple and rich models)
    organizer: { type: Schema.Types.ObjectId, refPath: 'organizerModel' },
    organizerModel: { type: String, enum: ['User', 'Company'] },
    organizerUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    organizerCompanyId: { type: Schema.Types.ObjectId, ref: 'Company' },

    title: { type: String, required: true, minlength: 2, maxlength: 150 },
    slug: { type: String, sparse: true },
    tagline: { type: String, maxlength: 200 },
    description: { type: String, required: true },
    bannerImage: { type: String },
    mediaGallery: { type: [String] },
    categoryId: { type: Schema.Types.ObjectId, ref: 'EventCategory' },
    eventType: {
      type: String,
      enum: ['hackathon', 'conference', 'workshop', 'networking', 'startup_showcase', 'hiring_event', 'webinar', 'other'],
    },
    tags: { type: [String] },
    mode: { type: String, enum: ['in_person', 'virtual', 'hybrid'] },
    location: {
      venue: { type: String },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      mapLink: { type: String },
    },
    virtualLink: { type: String },
    // Supports both field names for date
    date: { type: Date },
    startDateTime: { type: Date },
    endDateTime: { type: Date },
    timezone: { type: String },

    locationType: { type: String, enum: ['online', 'physical'] },
    linkOrAddress: { type: String },

    isFree: { type: Boolean, default: true },
    price: { type: Number, default: 0 },
    ticketPrice: { type: Number },
    currency: { type: String, default: 'USD' },
    maxAttendees: { type: Number, min: 1 },
    registrationCount: { type: Number, default: 0 },
    waitlistEnabled: { type: Boolean, default: false },
    registrationDeadline: { type: Date },

    status: {
      type: String,
      enum: ['PENDING_APPROVAL', 'AUTO_PUBLISHED', 'PENDING_PAYMENT', 'BLOCKED', 'COMPLETED', 'CANCELLED', 'PUBLISHED', 'draft', 'published', 'ongoing', 'completed', 'cancelled', 'pending_approval', 'blocked', 'hidden'],
      default: 'draft',
    },
    isBoosted: { type: Boolean, default: false },
    boostedUntil: { type: Date },
    requiresAdminReview: { type: Boolean, default: false },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },

    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    trustScore: { type: Number, default: 0 },
    venueVerified: { type: Boolean, default: false },
    reportCount: { type: Number, default: 0 },
    flagged: { type: Boolean, default: false },
    hidden: { type: Boolean, default: false },

    payoutStatus: {
      type: String,
      enum: ['LOCKED', 'PARTIAL_RELEASED', 'RELEASED', 'FROZEN'],
      default: 'LOCKED',
    },
    cancellationPolicy: {
      before7Days: { type: String, default: 'FULL_REFUND' },
      before3Days: { type: String, default: 'HALF_REFUND' },
      before48Hours: { type: String, default: 'NO_REFUND' }
    }
  },
  { timestamps: true }
);

EventSchema.index({ slug: 1 }, { sparse: true });
EventSchema.index({ startDateTime: 1 });
EventSchema.index({ date: 1 });
EventSchema.index({ organizer: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ isBoosted: -1, startDateTime: 1 });
EventSchema.index({ title: 'text', tagline: 'text', tags: 'text' });

// Single source of truth — exported as 'Event' for backward compat
export const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
