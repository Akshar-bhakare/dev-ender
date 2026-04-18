// ============================================================
// jobs.errors.ts — Typed error codes and factory for Jobs module
// ============================================================

export const JOB_ERROR_CODES = {
  JOB_NOT_FOUND: 'JOB_NOT_FOUND',
  JOB_NOT_PUBLISHED: 'JOB_NOT_PUBLISHED',
  COMPANY_NOT_VERIFIED: 'COMPANY_NOT_VERIFIED',
  USER_NOT_FACE_VERIFIED: 'USER_NOT_FACE_VERIFIED',
  INSUFFICIENT_EXPERIENCE: 'INSUFFICIENT_EXPERIENCE',
  DUPLICATE_APPLICATION: 'DUPLICATE_APPLICATION',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVITATION_EXPIRED: 'INVITATION_EXPIRED',
  APPLICATION_DEADLINE_PASSED: 'APPLICATION_DEADLINE_PASSED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  LISTING_NOT_EDITABLE: 'LISTING_NOT_EDITABLE',
  APPLICATION_NOT_FOUND: 'APPLICATION_NOT_FOUND',
  INVITATION_NOT_FOUND: 'INVITATION_NOT_FOUND',
  SAVED_JOB_NOT_FOUND: 'SAVED_JOB_NOT_FOUND',
} as const;

export type JobErrorCode = keyof typeof JOB_ERROR_CODES;

export class JobError extends Error {
  public readonly code: JobErrorCode;
  public readonly statusCode: number;

  constructor(code: JobErrorCode, message: string, statusCode = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.name = 'JobError';
  }
}

export const jobError = {
  notFound: () =>
    new JobError('JOB_NOT_FOUND', 'No job found with the given id or slug.', 404),
  notPublished: () =>
    new JobError('JOB_NOT_PUBLISHED', 'Job is not currently published.', 400),
  companyNotVerified: () =>
    new JobError('COMPANY_NOT_VERIFIED', 'Only verified companies can post jobs.', 403),
  notFaceVerified: () =>
    new JobError('USER_NOT_FACE_VERIFIED', 'Face verification is required to apply or save jobs.', 403),
  insufficientExperience: () =>
    new JobError('INSUFFICIENT_EXPERIENCE', 'Minimum 12 months of experience required to apply.', 403),
  duplicateApplication: () =>
    new JobError('DUPLICATE_APPLICATION', 'You have already applied to this job.', 409),
  unauthorized: (msg = 'You are not authorized to perform this action.') =>
    new JobError('UNAUTHORIZED', msg, 403),
  invitationExpired: () =>
    new JobError('INVITATION_EXPIRED', 'This job invitation has expired.', 410),
  deadlinePassed: () =>
    new JobError('APPLICATION_DEADLINE_PASSED', 'The application deadline for this job has passed.', 400),
  validationError: (msg: string) =>
    new JobError('VALIDATION_ERROR', msg, 422),
  invalidTransition: (from: string, to: string) =>
    new JobError('INVALID_STATUS_TRANSITION', `Cannot transition from '${from}' to '${to}'.`, 400),
  notEditable: () =>
    new JobError('LISTING_NOT_EDITABLE', 'Only draft or paused listings can be edited.', 400),
  applicationNotFound: () =>
    new JobError('APPLICATION_NOT_FOUND', 'Application not found.', 404),
  invitationNotFound: () =>
    new JobError('INVITATION_NOT_FOUND', 'Invitation not found.', 404),
  savedJobNotFound: () =>
    new JobError('SAVED_JOB_NOT_FOUND', 'Saved job not found.', 404),
};
