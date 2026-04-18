import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotification extends Document {
  recipient: Types.ObjectId;
  actor: Types.ObjectId;
  type: 'connection' | 'like' | 'comment' | 'job' | 'mention';
  entityId: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['connection', 'like', 'comment', 'job', 'mention'],
      required: true
    },
    // Reference to the specific Post, Comment, Connection Request, etc.
    entityId: { type: Schema.Types.ObjectId, required: true },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Index to quickly fetch a user's unread or all notifications
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, isRead: 1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
