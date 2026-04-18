# Confidential

## Devkraft Hackathon Problem Statement

This requirement is being provided as the project statement for a hackathon under **Devkraft**. Participants are expected to design and build this platform concept as their hackathon solution.

---

## Important Instructions for Participants

- Along with platform development, participants must also create proper test cases for the proposed solution.
- Test cases should cover functional flows, validations, edge cases, user roles, and core business logic.
- Evaluation may consider both implementation quality and quality of submitted test coverage.
- Teams should clearly document assumptions, scope limitations, and testing strategy.
- **AI Tools are allowed** for ideation, development assistance, debugging, documentation, testing, and productivity enhancement.
- An official GitHub repository will be provided where teams must save, manage, and submit their codebase.
- Participants may choose their own tech stack if it satisfies the following criteria:
  - Uses latest and well-supported technologies
  - Follows strong and scalable architecture principles
  - Delivers high performance even at large scale
  - Prioritizes security best practices
  - Is fully extensible for future growth

### Winners Will Be Evaluated On

- Uniform and consistent UI/UX across the platform
- Clear user flows and logical feature behavior
- Proper integration between modules
- Clean and efficient database design
- Scalable backend architecture
- Code quality and maintainability
- Functional completeness
- Innovation and usability
- Testing quality
- Overall product readiness
- Innovative mindset and creative problem solving
- SEO-friendly implementation
- Proper test coverage
- Strong security implementation
- Fast and accurate verification systems
- Smart growth and referral mechanics

---

## Core Concept

Build a platform that integrates the following core ideas:

### 1. Verified Human Identity & Duplicate Prevention (Highest Priority)

The platform must verify that registered users are real humans with fast and accurate face verification.

Login is allowed through **any email address**. Company-domain-only email restriction is removed.

Face verification must be:
- As fast as possible
- Accurate
- Designed to confirm a real human face only
- Resistant to fake attempts such as:
  - Printed photos
  - Mobile screen photos
  - Static images
  - Masked or manipulated visuals
  - Non-human objects
  - Duplicate identities

Goal: verified humans only.

### 2. Smart Promotion & Sponsored Reach Engine (2nd Highest Priority)

A high-visibility promotion system that helps users, companies, events, and opportunities reach the right audience through targeted sponsored placements, campaign-based discovery, and performance-driven visibility tools.

### 3. Professional Networking Platform

A clean, business-focused social environment where users create professional profiles, share industry-relevant updates, build connections, and discover opportunities.

Content should remain professional only and avoid casual entertainment-style clutter.

### 4. Business Opportunity Marketplace

A space where startups, businesses, investors, buyers, partners, and service providers can discover each other for funding, acquisitions, partnerships, growth, or strategic collaboration.

### 5. Business Service Exchange Between Organizations

A dedicated ecosystem where one company can hire or collaborate with another company for project execution, technical services, consulting, outsourcing, specialized work, or contract-based deliverables through structured professional workflows.

### 6. Experienced Professionals Job Posting Platform

A job ecosystem where verified companies can post opportunities only for experienced professionals. Freshers are out of scope for this version. The platform should support quality hiring, role matching, professional credibility, and business-focused recruitment workflows.

Only businesses and working professionals are allowed to sign up.

### 7. Event Discovery & Participation Platform

A system where users can discover, create, promote, register, and participate in professional events such as hackathons, startup showcases, workshops, networking sessions, conferences, and hiring events.

### 8. AI-Assisted User Experience Across Features

AI should help users perform actions more effectively across the platform.

Examples:
- Smart tips
- Usage suggestions
- Profile improvement guidance
- Campaign recommendations
- Networking suggestions
- Content enhancement
- Better utilization of platform features

### 9. Verified Company Identity & Duplicate Prevention

Company profiles should integrate with map and business listing services to reduce duplicate company creation and improve authenticity.

---

## Major Problem Statement Milestones

Participants must define practical and scalable solutions for the following trust and verification problems:

### 1. Personal Identity Claim Verification

How will the platform verify that the name a user claims is actually their own?

Example:
If someone creates a profile with a high-profile name such as a public business personality, how will the platform determine whether the claimed identity is authentic and not misleading?

Expected thinking area:
- Identity verification logic
- Profile authenticity signals
- Official document or professional proof flow
- Impersonation prevention
- Risk-based verification levels
- Manual review vs automated verification

### 2. Company Ownership Claim Verification

If a user adds a company and claims to be the owner, how will the system verify whether that person is actually the owner and not just an employee or unrelated person?

Expected thinking area:
- Ownership verification flow
- Business document validation
- Domain/email association
- Official business registry references
- Admin approval workflows
- Role claim verification logic

### 3. Event Authenticity & Post-Payment Trust

When an event is scheduled and users pay to attend, how will the platform confirm that the event is real and does not get falsely listed, manipulated, or cancelled unfairly after payment?

Expected thinking area:
- Organizer verification
- Event approval or trust scoring
- Refund / escrow / payout holding model
- Cancellation policy enforcement
- Attendee protection flows
- Fraud reporting and moderation

### 4. Direct Owner-to-Investor Trust in Investment Flows

When companies seek investment, how will the platform ensure that there is no unnecessary middleman or false representative between the actual owner and the investor?

Expected thinking area:
- Founder / owner verification
- Authorized representative mapping
- Direct communication controls
- Escalation / verification checkpoints
- Investment trust indicators
- Anti-broker / anti-middleman safeguards where required

---

## Growth, Referral & Reward System

### Referral Code System

- Every user gets an easily shareable referral code or referral link.
- Referral system should help maximize organic reach and new verified signups.
- Referral attribution must be trackable and fraud resistant.

### Milestone Rewards

Example reward flow:

- 100 verified joins through referral → Gift reward
- 500 verified joins through referral → Bigger gift reward
- First and fastest 1000 verified joins leaderboard → Eligible for 3 mega gifts (latest flagship smartphones or equivalent rewards)

### Reward Engine Requirements

- Milestone tracking
- Auto reward eligibility checks
- Fraud detection
- Referral leaderboard
- Notification system
- Admin reward management

---

## Advertising Offers & Coupon Engine

The platform should support auto-generated coupons, discount offers, and promotional credits for advertisers.

### Example Offer Logic

- Spend 60,000 and get 120,000 promotional value
- Promotional bonus validity can be limited to 3 months

### Required Features

- Auto coupon generation
- Offer rules engine
- Expiry management
- Wallet / credit tracking
- Usage analytics
- Campaign redemption history

---

## Suggested Product Direction

This should function as a complete ecosystem for professionals, founders, organisers, recruiters, investors, businesses, and communities.

Users should be able to:

- Build professional digital profiles
- Publish business-focused posts
- Discover people, companies, founders, recruiters, and opportunities
- Promote ideas, events, ventures, or business needs
- Create and manage professional events
- Register or book participation in events
- Connect for funding, hiring, partnerships, or growth
- Enable company-to-company project collaboration and service hiring
- Apply to experienced-level jobs
- Use AI guidance to improve actions and decisions on the platform
- Run targeted promotional campaigns
- Earn through referrals and rewards
- Engage in a trusted professional community

---

## Main Functional Pillars

### 1. Promotion & Visibility Layer
- Sponsored posts
- Sponsored events
- Profile or business boosting
- Audience targeting
- Campaign management
- Reach and engagement analytics

### 2. Professional Network Layer
- User profiles
- Company pages
- Professional content feed
- Follow, engage, save, share
- Business networking tools
- Connection recommendations

### 3. Opportunity Discovery Layer
- Business listings
- Collaboration opportunities
- Funding or partnership discovery
- Service requirement posting
- Strategic connection workflows

### 4. Organization Service Collaboration Layer
- Company service profiles
- Project requirement posting
- Proposal / bidding flows
- Contract-based engagement tracking
- Delivery milestone management
- Ratings and trust signals

### 5. Job Posting Layer
- Experienced job listings only
- Company hiring dashboard
- Applicant filtering
- Professional matching
- Hiring workflow management

### 6. Events & Participation Layer
- Event creation and management
- Registration / booking system
- Ticketing or access control
- Schedules and reminders
- Attendance management
- Event analytics

### 7. AI Assistance Layer
- Smart recommendations
- Profile optimization tips
- Campaign suggestions
- Opportunity matching
- Productivity assistance
- Guided onboarding

### 8. Trust & Verification Layer
- Human face verification
- Duplicate detection logic
- Company verification workflows
- Ownership claim verification
- Identity claim verification
- Event authenticity checks
- Investor-founder trust safeguards
- Location validation
- Business identity trust signals
- Moderation checks

### 9. Growth & Rewards Layer
- Referral engine
- Milestone rewards
- Leaderboards
- Coupon engine
- Promotional wallet logic

---

## Login and Verification Requirements

- Login must allow any valid email address.
- Previous company-domain-only restriction is removed.
- Face verification is mandatory as part of signup or onboarding verification.
- Face verification should be optimized for speed and accuracy.
- The platform should allow only verified human users to continue into critical workflows.
- Participants should propose how verification status impacts access to:
  - Posting
  - Messaging
  - Event creation
  - Investment participation
  - Company claiming
  - Advertising access

---



---

## High-Level Platform Expectation

The platform should be scalable, modular, secure, and cloud-ready with separate systems for:

- Authentication & user management
- Content management
- Opportunity engine
- Event engine
- Promotion engine
- Organization collaboration engine
- Job engine
- AI assistance engine
- Verification & trust engine
- Growth & rewards engine
- Analytics & reporting
- Role-based access control
- Moderation & compliance

---

## Proposed Vision Statement

Build a trusted professional ecosystem where users can connect, grow, discover opportunities, collaborate commercially, hire experienced talent, participate in events, and promote their goals through one unified platform.
