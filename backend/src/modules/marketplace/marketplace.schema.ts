import { z } from 'zod';

export const ServiceProfileSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  categories: z.array(z.string()),
  skills: z.array(z.string()),
  minBudget: z.number().optional(),
  preferredEngagementModel: z.enum(['fixed', 'hourly', 'retainer']).optional(),
  caseStudies: z.array(z.object({
    title: z.string(),
    link: z.string().url().optional(),
    description: z.string()
  })),
  geoPreferences: z.array(z.string())
});

export const ServiceRequirementSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  categories: z.array(z.string()),
  skillsRequired: z.array(z.string()),
  budgetRange: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.string().default('USD')
  }),
  engagementModel: z.enum(['fixed', 'hourly', 'retainer']),
  expectedStartDate: z.string().datetime().optional(),
  expectedDuration: z.string().optional(),
  locationConstraints: z.string().optional(),
  visibility: z.enum(['public', 'invite-only', 'network-only']).default('public')
});

export const ProposalSchema = z.object({
  requirementId: z.string(),
  proposalSummary: z.string().min(50),
  approach: z.string().min(50),
  timelineEstimate: z.string(),
  pricingModel: z.enum(['fixed', 'hourly']),
  priceQuote: z.number(),
  assumptions: z.string().optional(),
  attachments: z.array(z.string()).default([])
});

export const ContractSchema = z.object({
  proposalId: z.string(),
  title: z.string(),
  scopeOfWork: z.string(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  paymentTerms: z.string().optional()
});

export const MilestoneSchema = z.object({
  title: z.string(),
  description: z.string(),
  amount: z.number(),
  dueDate: z.string().datetime().optional()
});

export const RatingSchema = z.object({
  overallScore: z.number().min(1).max(5),
  qualityScore: z.number().min(1).max(5),
  communicationScore: z.number().min(1).max(5),
  timelinessScore: z.number().min(1).max(5),
  reviewText: z.string().optional()
});
