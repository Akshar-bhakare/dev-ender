// events.schema.ts — Re-exports from the unified Event model in models/Event.ts
// This prevents the Mongoose OverwriteModelError that occurs when two files
// both call mongoose.model('Event', ...).

// Value exports (runtime)
export { Event as EventModel, EventCategory } from '../../models/Event.js';

// Type-only exports (compile-time only, erased at runtime)
export type { IEvent, IEventCategory } from '../../models/Event.js';
