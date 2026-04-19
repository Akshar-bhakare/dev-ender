# Remaining Implementation Tasks - SyncUp

This document outlines the pending technical tasks and enhancements required to bring the SyncUp platform to a production-ready state.

## 1. Infrastructure & Connectivity
- [ ] **Stable Database Connection**: Resolve persistent `ETIMEDOUT` issues with MongoDB Atlas.
    - *Option A*: Whitelist deployment environment IP ranges.
    - *Option B*: Implement a local MongoDB Docker container for development consistency.
- [ ] **Environment Variable Validation**: Add a startup check to ensure all required `.env` variables (Cloudinary, Stripe, Onfido) are present and valid.

## 2. Verification Flow Enhancements
- [ ] **Advanced OCR Processing**:
    - Current Tesseract-based OCR in `OcrService` is sensitive to image quality.
    - *Improvement*: Add image pre-processing (grayscale, contrast boost) before OCR.
    - *Improvement*: Add support for PDF parsing in addition to image-based docs.
- [ ] **Registry Integration**:
    - Integrate `companyStep6Ownership` with official company registries (e.g., Companies House, MCA) to automate the validation of ownership percentages.
- [ ] **Manual Review Dashboard**:
    - Build an admin interface to review "FLAGGED" documents where OCR name matching failed but might be visually correct (e.g., abbreviations).

## 3. User Experience & UI
- [ ] **Mobile Responsiveness**: Complete a full audit of the `RegisterWizard` and `CompanySteps` on mobile viewports.
- [ ] **Verification Feedback**: Add a real-time "Verification Status" badge on the user profile that updates via WebSockets or polling when background Onfido checks complete.
- [ ] **Email Branding**: Replace raw text OTP emails in `OtpService` with branded HTML templates using a service like SendGrid or Resend.

## 4. Feature Completion
- [ ] **Payments (Stripe)**:
    - Finalize `StripeService` integration for premium company features or job postings.
    - Implement webhook handling for `checkout.session.completed`.
- [ ] **Audit & Compliance**:
    - Expand `AuditLog` to cover all sensitive data access and document uploads to satisfy compliance requirements.
- [ ] **Face Matching**:
    - Finalize the comparison between the Face Snapshot and the Photo on the ID Document (Face-to-Doc matching).

## 5. Testing & Security
- [ ] **Integration Tests**: Write E2E tests for the signup flow using Playwright or Cypress.
- [ ] **Rate Limiting**: Implement Fastify rate limiting on the `/auth/verify-otp` and `/auth/login` endpoints to prevent brute-force attacks.
- [ ] **Input Sanitization**: Ensure all OCR extracted text is properly sanitized before being displayed or stored to prevent XSS.
