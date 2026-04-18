// ============================================================
// jobs.validation.ts — Zod schemas for request validation
// ============================================================

import { z } from 'zod';

const futureDate = z.string().refine(
  (val) => new Date(val) > new Date(),
  { message: 'Date must be in the future' }
);

const JobBaseSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(120, 'Title must be at most 120 characters'),
  description: z.string().min(1, 'Description is required'),
  categoryId: z.string().optional(),
  jobType: z.enum(['full_time', 'part_time', 'contract', 'freelance']),
  workMode: z.enum(['remote', 'hybrid', 'on_site']),
  location: z
    .object({
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  minExperienceMonths: z
    .number()
    .int()
    .min(12, 'Minimum experience must be at least 12 months'),
  maxExperienceMonths: z.number().int().min(12).optional(),
  minSalary: z.number().optional(),
  maxSalary: z.number().optional(),
  salaryCurrency: z.string().default('INR'),
  salaryVisible: z.boolean().default(true),
  requiredSkills: z
    .array(
      z.object({
        skillId: z.string(),
        isPrimary: z.boolean().default(false),
      })
    )
    .min(1, 'At least one required skill must be specified')
    .max(20, 'Maximum 20 required skills allowed'),
  openings: z.number().int().min(1).max(1000).default(1),
  applicationDeadline: futureDate.optional(),
  expiresAt: z.string().optional(),
});

// Helper for shared refinements
const refineJob = <T extends z.ZodTypeAny>(schema: T) => {
  return schema
    .refine(
      (data: any) =>
        !data.minExperienceMonths || !data.maxExperienceMonths ||
        data.maxExperienceMonths >= data.minExperienceMonths,
      {
        message: 'maxExperienceMonths must be >= minExperienceMonths',
        path: ['maxExperienceMonths'],
      }
    )
    .refine(
      (data: any) =>
        !data.minSalary || !data.maxSalary || data.maxSalary >= data.minSalary,
      {
        message: 'maxSalary must be >= minSalary',
        path: ['maxSalary'],
      }
    )
    .refine(
      (data: any) => {
        if (data.applicationDeadline && data.expiresAt) {
          return new Date(data.expiresAt) > new Date(data.applicationDeadline);
        }
        return true;
      },
      {
        message: 'expiresAt must be after applicationDeadline',
        path: ['expiresAt'],
      }
    );
};

export const CreateJobSchema = refineJob(JobBaseSchema);
export type CreateJobInput = z.infer<typeof CreateJobSchema>;

export const UpdateJobSchema = refineJob(JobBaseSchema.partial());
export type UpdateJobInput = z.infer<typeof UpdateJobSchema>;

export const ApplyToJobSchema = z.object({
  resumeUrl: z.string().url('resumeUrl must be a valid URL'),
  coverLetter: z.string().optional(),
});
export type ApplyToJobInput = z.infer<typeof ApplyToJobSchema>;

export const UpdateApplicationStageSchema = z.object({
  stage: z.enum(['shortlisted', 'interviewing', 'offered', 'hired', 'rejected']),
  rejectionReason: z.string().optional(),
  notes: z.string().optional(),
});
export type UpdateApplicationStageInput = z.infer<typeof UpdateApplicationStageSchema>;

export const InviteUserSchema = z.object({
  invitedUserId: z.string().min(1),
  message: z.string().optional(),
});
export type InviteUserInput = z.infer<typeof InviteUserSchema>;

export const RespondToInvitationSchema = z.object({
  status: z.enum(['accepted', 'declined']),
});
export type RespondToInvitationInput = z.infer<typeof RespondToInvitationSchema>;

export const JobSearchSchema = z.object({
  q: z.string().optional(),
  categoryId: z.string().optional(),
  jobType: z.enum(['full_time', 'part_time', 'contract', 'freelance']).optional(),
  workMode: z.enum(['remote', 'hybrid', 'on_site']).optional(),
  city: z.string().optional(),
  minExp: z.coerce.number().optional(),
  maxExp: z.coerce.number().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type JobSearchInput = z.infer<typeof JobSearchSchema>;
