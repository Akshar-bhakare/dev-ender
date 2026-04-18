import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEvent extends Document {
  organizer: Types.ObjectId;
  organizerModel: 'User' | 'Company';
  title: string;
  description: string;
  date: Date;
  locationType: 'online' | 'physical';
  linkOrAddress?: string;
  price: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    organizer: { type: Schema.Types.ObjectId, required: true, refPath: 'organizerModel' },
    organizerModel: { type: String, required: true, enum: ['User', 'Company'] },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    locationType: {
      type: String,
      enum: ['online', 'physical'],
      required: true
    },
    linkOrAddress: { type: String },
    price: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },
  { timestamps: true }
);

EventSchema.index({ date: 1 });
EventSchema.index({ organizer: 1, date: 1 });

export const Event = mongoose.model<IEvent>('Event', EventSchema);
