import { z } from 'zod';

export const EventLocationSchema = z.object({
  venue: z.string().min(1, "Venue is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  mapLink: z.string().url().optional().nullable(),
});

export const CreateEventSchema = z.object({
  title: z.string().min(5).max(150),
  tagline: z.string().max(200).optional().nullable(),
  description: z.string().min(10, 'Description must be at least 10 chars'),
  bannerImage: z.string().url('Banner must be a valid URL'),
  mediaGallery: z.array(z.string().url()).max(10).optional().default([]),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
  eventType: z.enum(['hackathon', 'conference', 'workshop', 'networking', 'startup_showcase', 'hiring_event', 'webinar', 'other']),
  tags: z.array(z.string().max(30)).max(10).optional().default([]),
  mode: z.enum(['in_person', 'virtual', 'hybrid']),
  location: EventLocationSchema.optional().nullable(),
  virtualLink: z.string().url().optional().nullable(),
  startDateTime: z.string().datetime().refine(val => new Date(val) > new Date(), 'Start date must be in the future'),
  endDateTime: z.string().datetime(),
  timezone: z.string().min(1, 'Timezone is required'),
  isFree: z.boolean(),
  ticketPrice: z.number().int().min(1).optional().nullable(),
  currency: z.string().default('INR'),
  maxAttendees: z.number().int().min(1),
  waitlistEnabled: z.boolean().default(false),
  registrationDeadline: z.string().datetime().optional().nullable(),
}).refine(data => {
  if (new Date(data.endDateTime) <= new Date(data.startDateTime)) {
    return false;
  }
  return true;
}, { message: "End date must be after start date", path: ["endDateTime"] })
.refine(data => {
  if (['in_person', 'hybrid'].includes(data.mode) && !data.location) {
    return false;
  }
  return true;
}, { message: "Location is required for in_person or hybrid mode", path: ["location"] })
.refine(data => {
  if (['virtual', 'hybrid'].includes(data.mode) && !data.virtualLink) {
    return false;
  }
  return true;
}, { message: "Virtual link is required for virtual or hybrid mode", path: ["virtualLink"] })
.refine(data => {
  if (!data.isFree && (!data.ticketPrice || data.ticketPrice <= 0)) {
    return false;
  }
  return true;
}, { message: "Ticket price must be > 0 for paid events", path: ["ticketPrice"] })
.refine(data => {
  if (data.registrationDeadline && new Date(data.registrationDeadline) >= new Date(data.startDateTime)) {
    return false;
  }
  return true;
}, { message: "Registration deadline must be before start date", path: ["registrationDeadline"] });

// We define UpdateEventSchema manually since CreateEventSchema has refinements.
export const UpdateEventSchemaBase = z.object({
  title: z.string().min(5).max(150),
  tagline: z.string().max(200).optional().nullable(),
  description: z.string().min(10),
  bannerImage: z.string().url(),
  mediaGallery: z.array(z.string().url()).max(10).optional(),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  eventType: z.enum(['hackathon', 'conference', 'workshop', 'networking', 'startup_showcase', 'hiring_event', 'webinar', 'other']),
  tags: z.array(z.string().max(30)).max(10).optional(),
  mode: z.enum(['in_person', 'virtual', 'hybrid']),
  location: EventLocationSchema.optional().nullable(),
  virtualLink: z.string().url().optional().nullable(),
  startDateTime: z.string().datetime(),
  endDateTime: z.string().datetime(),
  timezone: z.string(),
  isFree: z.boolean(),
  ticketPrice: z.number().int().min(1).optional().nullable(),
  currency: z.string(),
  maxAttendees: z.number().int().min(1),
  waitlistEnabled: z.boolean(),
  registrationDeadline: z.string().datetime().optional().nullable(),
});

export const UpdateEventSchema = UpdateEventSchemaBase.partial();

export const CancelEventSchema = z.object({
  cancellationReason: z.string().min(5, 'Cancellation reason is required'),
});

export const SearchEventsSchema = z.object({
  q: z.string().optional(),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  eventType: z.enum(['hackathon', 'conference', 'workshop', 'networking', 'startup_showcase', 'hiring_event', 'webinar', 'other']).optional(),
  mode: z.enum(['in_person', 'virtual', 'hybrid']).optional(),
  city: z.string().optional(),
  isFree: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});
