import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  uid: string;
  action: 'register' | 'login' | 'doc_verify' | 'doc_mismatch';
  similarity?: number;
  docNumber?: string; // hashed
  ip?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    uid: {
      type: String,
      required: true,
      index: true
    },
    action: {
      type: String,
      enum: ['register', 'login', 'doc_verify', 'doc_mismatch'],
      required: true
    },
    similarity: {
      type: Number
    },
    docNumber: {
      type: String // hashed
    },
    ip: {
      type: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
