import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProfile extends Document {
  user: Types.ObjectId;
  firstName: string;
  lastName: string;
  headline?: string;
  about?: string;
  avatarUrl?: string;
  experience: {
    title: string;
    companyName: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    description?: string;
  }[];
  education: {
    schoolName: string;
    degree: string;
    fieldOfStudy?: string;
    startDate: Date;
    endDate?: Date;
  }[];
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    headline: { type: String, trim: true },
    about: { type: String, trim: true },
    avatarUrl: { type: String },
    experience: [{
      title: { type: String, required: true },
      companyName: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date },
      current: { type: Boolean, default: false },
      description: { type: String }
    }],
    education: [{
      schoolName: { type: String, required: true },
      degree: { type: String, required: true },
      fieldOfStudy: { type: String },
      startDate: { type: Date, required: true },
      endDate: { type: Date }
    }],
    skills: [{ type: String, trim: true }]
  },
  { timestamps: true }
);

// Index for name searches
ProfileSchema.index({ firstName: 1, lastName: 1 });

export const Profile = mongoose.model<IProfile>('Profile', ProfileSchema);
