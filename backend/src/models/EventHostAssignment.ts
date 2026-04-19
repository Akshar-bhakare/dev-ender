import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEventHostAssignment extends Document {
  userId: Types.ObjectId;
  companyId: Types.ObjectId;
  role: 'COMPANY_ADMIN' | 'COMPANY_EVENT_HOST';
  assignedBy: Types.ObjectId;
  assignedAt: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventHostAssignmentSchema = new Schema<IEventHostAssignment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    role: { type: String, enum: ['COMPANY_ADMIN', 'COMPANY_EVENT_HOST'], default: 'COMPANY_EVENT_HOST' },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedAt: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

EventHostAssignmentSchema.index({ userId: 1, companyId: 1 }, { unique: true });

export const EventHostAssignment = mongoose.models.EventHostAssignment || mongoose.model<IEventHostAssignment>('EventHostAssignment', EventHostAssignmentSchema);
