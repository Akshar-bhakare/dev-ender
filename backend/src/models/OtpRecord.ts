import mongoose, { Schema, Document } from 'mongoose';

export type OtpType = 'email_verify' | 'phone_verify' | 'password_reset';

export interface IOtpRecord extends Document {
  target: string; // email or phone
  otpHash: string;
  type: OtpType;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OtpRecordSchema = new Schema<IOtpRecord>(
  {
    target: { type: String, required: true, index: true },
    otpHash: { type: String, required: true },
    type: { type: String, enum: ['email_verify', 'phone_verify', 'password_reset'], required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// TTL index to automatically delete expired OTPs (plus a short buffer)
OtpRecordSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 60 });

export const OtpRecord = mongoose.model<IOtpRecord>('OtpRecord', OtpRecordSchema);
