# Product Requirements Document (PRD)
## SyncUp — Professional Ecosystem Platform
### Version 1.0 | Hackathon Build Specification

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Vision & Goals](#2-vision--goals)
3. [User Types & Roles](#3-user-types--roles)
4. [Authentication & Verification System](#4-authentication--verification-system)
5. [Professional Profiles](#5-professional-profiles)
6. [Content & Feed System](#6-content--feed-system)
7. [Professional Networking](#7-professional-networking)
8. [Job Posting & Hiring Platform](#8-job-posting--hiring-platform)
9. [Business Opportunity Marketplace](#9-business-opportunity-marketplace)
10. [Organization Service Collaboration](#10-organization-service-collaboration)
11. [Events & Participation Platform](#11-events--participation-platform)
12. [AI Assistance Engine](#12-ai-assistance-engine)
13. [Promotion & Visibility Engine](#13-promotion--visibility-engine)
14. [Advertising, Offers & Coupon Engine](#14-advertising-offers--coupon-engine)
15. [Growth, Referral & Reward System](#15-growth-referral--reward-system)
16. [Trust & Verification Engine](#16-trust--verification-engine)
17. [Search & Discovery](#17-search--discovery)
18. [Messaging & Communication](#18-messaging--communication)
19. [Notifications System](#19-notifications-system)
20. [Analytics & Reporting](#20-analytics--reporting)
21. [Admin Panel & Moderation](#21-admin-panel--moderation)
22. [Database Schema Design](#22-database-schema-design)
23. [API Architecture](#23-api-architecture)
24. [Security Requirements](#24-security-requirements)
25. [Tech Stack](#25-tech-stack)
26. [Testing Strategy](#26-testing-strategy)
27. [Evaluation Checklist](#27-evaluation-checklist)

---

## 1. Executive Summary

SyncUp is a full-featured professional ecosystem platform designed to connect professionals, companies, founders, recruiters, investors, and communities in a single trusted digital environment. The platform goes beyond simple networking — it integrates job hiring, B2B collaboration, event discovery, AI-assisted guidance, promotional reach tools, and a verified identity layer to ensure authenticity at every touchpoint.

This document serves as the complete specification for building the platform from scratch.

---

## 2. Vision & Goals

> **Vision:** Build a trusted professional ecosystem where users can connect, grow, discover opportunities, collaborate commercially, participate in events, and promote their goals through one unified platform.

### Core Goals

- Enable professional networking between individuals and companies
- Provide verified identity to prevent fraud and duplicate profiles
- Surface relevant job listings for experienced professionals only
- Facilitate B2B service exchange and project-based collaboration
- Offer an event creation, promotion, and participation system
- Integrate AI-powered recommendations throughout all features
- Support a promotion engine for paid and organic visibility
- Drive growth through referrals, milestone rewards, and incentives

---

## 3. User Types & Roles

### 3.1 User Roles

| Role | Description |
|---|---|
| Individual Professional | Working professional with experience; can apply for jobs, network, post content |
| Company / Business | Verified business entity; can post jobs, collaborate, promote, list services |
| Founder / Startup | Can seek funding, post opportunities, list company for collaboration |
| Recruiter | Affiliated with a company; can post jobs and review applicants |
| Investor | Can browse companies and founders seeking investment |
| Event Organizer | Can create, manage and promote professional events |
| Admin | Platform-level access for moderation, verification, and analytics |

### 3.2 Role Constraints

- Freshers / students are **out of scope** for job posting target audience
- Only verified users can post jobs, create events, or send investment inquiries
- A user can hold multiple roles (e.g., Founder + Investor)
- Company accounts must be verified before posting any content

### 3.3 User States

| State | Description |
|---|---|
| `REGISTERED` | Email verified, face verification pending |
| `FACE_VERIFIED` | Passed liveness check |
| `PROFILE_COMPLETE` | All mandatory profile fields filled |
| `COMPANY_VERIFIED` | Business identity confirmed |
| `SUSPENDED` | Flagged by moderation |
| `BANNED` | Permanently removed |

---

## 4. Authentication & Verification System

### 4.1 Registration Flow

1. User enters any valid email address (no domain restriction)
2. OTP sent to email for verification
3. User fills basic profile info (name, role type)
4. **Face verification is mandatory** before accessing core features
5. Profile goes live once face verification passes

### 4.2 Face Verification Requirements

The face verification system must be:

- **Fast** — complete under 5 seconds
- **Accurate** — confirm it is a real human face
- **Liveness-aware** — detect and reject:
  - Printed/displayed photos
  - Mobile screen photos
  - Static images
  - Masked or manipulated visuals
  - Non-human objects
  - Duplicate face attempts (same face, different account)

**Technical Approach:**
- Use a WebRTC-based live camera feed
- Perform frame analysis with a liveness detection model
- Hash facial embeddings for duplicate detection across accounts
- Store only hashed biometric vectors, never raw images, for privacy

### 4.3 Login

- Email + Password (standard)
- Magic link login via email
- OAuth: Google login allowed
- Face re-verification not required on every login, but triggered for sensitive actions (job applications, investment inquiries, event ticket purchase)

### 4.4 Verification Status Impact on Features

| Feature | Unverified | Face Verified | Company Verified |
|---|---|---|---|
| Browse profiles | ✅ | ✅ | ✅ |
| Send connection requests | ❌ | ✅ | ✅ |
| Post content | ❌ | ✅ | ✅ |
| Apply to jobs | ❌ | ✅ | ✅ |
| Post jobs | ❌ | ❌ | ✅ |
| Create events | ❌ | ✅ | ✅ |
| Post investment opportunity | ❌ | ❌ | ✅ |
| Purchase advertising | ❌ | ❌ | ✅ |
| Company claiming | ❌ | ✅ | N/A |

---

## 5. Professional Profiles

### 5.1 Individual Profile Fields

**Basic Info**
- Full name
- Profile photo (verified against face verification)
- Headline / tagline (e.g., "Senior Backend Engineer at Infosys")
- Location (city, country)
- About / bio section (rich text, up to 2000 chars)
- Website URL
- Contact info (visibility controlled by user)

**Experience Section**
- Company name (with company page link if available)
- Job title
- Employment type (Full-time, Part-time, Freelance, Contract, Internship)
- Start date / End date
- Description of responsibilities
- Skills used in role
- Media attachments (projects, links)

**Education Section**
- Institution name
- Degree type
- Field of study
- Start year / End year
- Grade / GPA (optional)
- Activities and societies

**Skills Section**
- Skills tags (searchable)
- Endorsements from connections
- Skill assessments / badges

**Projects Section**
- Project title
- Description
- Technologies used
- Project URL / GitHub
- Collaborators (tag other users)
- Date range

**Certifications**
- Certificate name
- Issuing organization
- Issue date / Expiry date
- Credential ID
- Credential URL

**Publications & Patents**
- Title
- Publisher / Office
- Publication/filing date
- URL

**Recommendations**
- Written by a connection
- Role at the time
- Visible on profile

**Profile Visibility Controls**
- Public / Connections only / Private for each section
- Open to work toggle (visible to recruiters only or publicly)
- Open to business inquiries toggle

### 5.2 Company / Organization Profile

- Company name
- Logo
- Cover photo / banner
- Tagline
- Industry
- Company size (employees range)
- Founded year
- Headquarters location
- Website
- About (rich text)
- Specialties / service tags
- Follower count
- Linked employees (users who list this company in experience)
- Verification badge
- Jobs posted (active listings tab)
- Products/services tab
- Recent posts tab

### 5.3 Profile Completeness Score

Display a visual completeness meter guiding users to fill missing sections. Incomplete profiles have lower discoverability.

---

## 6. Content & Feed System

### 6.1 Post Types

| Type | Description |
|---|---|
| Text Post | Plain or rich text update |
| Image Post | Single or carousel of images |
| Video Post | Native video upload |
| Document Post | PDF or slide share |
| Article | Long-form blog-style content with title, banner, rich text |
| Poll | Up to 4 options, duration 1–14 days |
| Event Share | Share an event card |
| Job Share | Share a job listing |
| Celebration | Work anniversary, new job, certification, etc. |
| Repost | Reshare someone else's post with optional comment |

### 6.2 Post Visibility Options

- Public (anyone on and off platform)
- Connections only
- Followers
- Specific groups / communities (future)

### 6.3 Feed Algorithm

The feed is a ranked list assembled from:

**Content Sources:**
- Posts from 1st-degree connections
- Posts from followed companies/people
- Sponsored/promoted posts (labeled)
- Suggested posts (based on interests, skills, interactions)
- Trending posts in user's industry

**Ranking Signals:**
- Recency
- Engagement velocity (likes, comments, shares in first 30 mins)
- Relationship strength with poster
- Content type preference (video > text for some users)
- User's past interactions
- Post relevance to user's skill set and industry

**Feed Controls (user-facing):**
- Sort by: Most relevant / Most recent
- Mute/unfollow from feed
- Mark as not interested
- Report inappropriate content

### 6.4 Interactions

- Like (with reaction types: Like, Celebrate, Support, Insightful, Funny)
- Comment (threaded, nested up to 3 levels)
- Repost (with or without commentary)
- Save / Bookmark
- Share via link / DM
- Tag people / companies in posts

### 6.5 Hashtags & Mentions

- `#hashtag` support for discoverability
- `@mention` for users and company pages
- Trending hashtags shown in sidebar

---

## 7. Professional Networking

### 7.1 Connections vs Followers

| | Connections | Followers |
|---|---|---|
| Mutual | ✅ Yes | ❌ No (one-way) |
| See their posts | ✅ | ✅ |
| Message directly | ✅ | ❌ (unless InMail) |
| See contact info | ✅ | ❌ |

### 7.2 Connection Request Flow

1. User A sends connection request (optional note)
2. User B receives notification
3. User B accepts / ignores / mark as spam
4. On accept: both added to each other's connection list; message thread unlocked

### 7.3 Connection Degrees

- 1st degree: Direct connections
- 2nd degree: Connections of connections
- 3rd degree: Connections of 2nd degree
- Profile views show degree indicator

### 7.4 People You May Know (PYMK)

Algorithm considers:
- Shared connections
- Same company
- Same school / education
- Same skills / industry
- Profile viewers
- Geographic proximity
- Event co-attendance

### 7.5 Following

- Follow anyone without mutual approval
- Unfollow silently
- Company pages are "followed" not "connected"

### 7.6 Connection Management

- Withdraw sent request
- Remove a connection
- Block a user (prevents all interaction, hides profile from each other)
- Restrict (can see public posts only)

---

## 8. Job Posting & Hiring Platform

### 8.1 Scope Constraint

> Only **experienced professionals** can be targeted. Freshers are explicitly out of scope.

### 8.2 Job Posting (Company Side)

**Job Fields:**
- Job title
- Company (linked to verified company page)
- Location (on-site / hybrid / remote + city)
- Employment type
- Experience required (minimum years)
- Salary range (optional, but encouraged)
- Job description (rich text)
- Required skills (tags)
- Nice-to-have skills
- Industry
- Department
- Application deadline
- Number of openings
- Easy Apply toggle (platform-native apply) vs External link

**Job Management Dashboard:**
- List all active / paused / closed jobs
- Applicant count per listing
- Applicant pipeline (Applied → Screened → Interview → Offer → Hired / Rejected)
- Bulk status updates
- Export applicants to CSV
- Saved filters for reviewing

### 8.3 Job Application (Candidate Side)

**Easy Apply Flow:**
1. One-click apply using profile data
2. Optionally attach updated resume
3. Answer screener questions (if set by employer)
4. Submit and receive confirmation

**Application Tracking (Candidate):**
- Applied jobs list
- Status per application (In Review / Viewed / Shortlisted / Rejected)
- Saved/bookmarked jobs
- Job alerts (email + in-app) based on saved searches

### 8.4 Applicant Filtering (Recruiter)

Filters available:
- Skills match %
- Years of experience
- Location
- Education level
- Most recent application first
- Applied via Easy Apply only
- Profile completeness score

### 8.5 Role Matching

- System auto-scores each applicant 0–100 against job requirements
- Match score shown to recruiter next to each applicant
- Candidate sees "Strong match" / "Good match" / "Fair match" badge on job card

### 8.6 Job Discovery (Candidate)

- "Jobs for you" — AI-personalized feed
- Search with filters (keyword, location, industry, experience, salary, remote)
- Company-specific job pages
- Job alerts: saved search with email notifications
- Trending jobs in your industry
- Jobs at companies followed

---

## 9. Business Opportunity Marketplace

### 9.1 Opportunity Types

| Type | Who Posts | Who Sees |
|---|---|---|
| Funding Opportunity | Investor | Founders / Startups |
| Investment Seeking | Founder | Investors |
| Partnership Request | Company | Companies / Professionals |
| Acquisition Intent | Company | Target Companies |
| Strategic Alliance | Any business | Businesses |
| Vendor/Supplier Need | Company | Service Providers |

### 9.2 Opportunity Listing Fields

- Title
- Opportunity type (enum above)
- Description
- Budget / investment range (optional)
- Industry
- Location preference (or remote/global)
- Deadline
- Contact method (message only / email / call)
- Attachments (pitch deck, proposal)
- Visibility (public / connections / private link)

### 9.3 Discovery & Matching

- Browse opportunities by type, industry, location
- AI-recommended opportunities based on profile
- "Express Interest" button (opens message thread)
- Save / bookmark opportunity
- Share opportunity

---

## 10. Organization Service Collaboration

### 10.1 Overview

Companies can post service requirements and other companies can bid / propose — enabling B2B project outsourcing and collaboration.

### 10.2 Service Requirement Posting

**Fields:**
- Project title
- Description
- Service category (Development, Design, Legal, Consulting, Marketing, etc.)
- Budget range
- Timeline / deadline
- Required skills / tech stack
- Preferred company size
- Location preference
- Confidentiality level

### 10.3 Proposal / Bidding Flow

1. Company A posts a requirement
2. Company B submits a proposal (cover letter + pricing + timeline + portfolio)
3. Company A reviews proposals, filters by relevance / rating / price
4. Company A shortlists → initiates negotiation via messaging
5. Contract agreed → milestone tracking begins
6. Each milestone: deliverable submitted → reviewed → approved / revision requested
7. Final delivery → rating and trust signal published

### 10.4 Service Provider Profiles

- Company service page with offerings listed
- Portfolio of past delivered projects
- Ratings from past clients
- Verified company badge
- Response rate and average response time

### 10.5 Contract Tracking

- Milestones list (title, due date, description, status)
- Status per milestone: Pending / In Progress / Submitted / Approved / Revision Requested
- Overall project progress bar
- Payment tracking (if payment integration enabled)
- Dispute flagging (routed to admin)

---

## 11. Events & Participation Platform

### 11.1 Event Types

- Hackathon
- Startup Showcase
- Conference
- Workshop
- Webinar
- Networking Mixer
- Hiring Fair
- Pitch Competition
- Mentorship Session
- Training / Bootcamp

### 11.2 Event Creation Fields

**Basic Info:**
- Event name
- Event type
- Banner image
- Description (rich text)
- Organizer (individual or company)
- Co-organizers (tag other users/companies)

**Schedule:**
- Start date/time
- End date/time
- Timezone
- Recurring toggle (weekly/monthly)

**Location:**
- In-person (venue name, address, map pin)
- Online (video link — Zoom/Meet/custom)
- Hybrid

**Tickets:**
- Free / Paid / Invite-only
- Multiple ticket tiers (e.g., General, VIP, Speaker)
- Per-tier: name, description, price, quantity, sale deadline
- Early bird pricing (auto-switch at set date)

**Settings:**
- Registration approval (auto or manual)
- Capacity limit
- Waitlist toggle
- Visibility (public / followers / private link)

### 11.3 Event Discovery

- Browse events by type, date, location, industry
- Recommended events based on profile
- Events from followed companies
- Events with connections attending
- Filter: Free only / Paid only / Online only / Near me

### 11.4 Registration & Ticketing

- User clicks "Register" or "Buy Ticket"
- For paid: payment gateway integration
- Confirmation email with ticket (QR code)
- Add to calendar (Google / iCal)
- Ticket management page for attendee

### 11.5 Event Management (Organizer)

- Attendee list (name, ticket tier, registration date, check-in status)
- QR code check-in scanner
- Messaging broadcast to all attendees
- Event analytics (views, registrations, attendance rate)
- Edit event details (with attendee notification)
- Cancel event (with refund trigger for paid)
- Post-event survey

### 11.6 Event Authenticity & Trust

- Organizer must be face-verified
- Paid events require additional organizer verification
- Event approval scoring by platform
- Refund/escrow holding for paid events (funds released post-event)
- Fraud reporting by attendees
- Platform moderation on flagged events

---

## 12. AI Assistance Engine

### 12.1 AI Features by Context

**Profile Optimization:**
- Analyze profile completeness and suggest improvements
- Recommend headline rewrites for better discoverability
- Suggest skills based on experience entries
- Grade profile strength vs. peers in same industry

**Content Creation:**
- Suggest post topics based on user's industry and trends
- Grammar / tone improvement for drafts
- Hashtag recommendations for posts
- Article outline generator

**Job Seeking:**
- Match score explanation ("You match 78% because...")
- Resume tailoring tips per job description
- Interview preparation prompts
- Salary range benchmarking

**Networking:**
- "People you should connect with" reasoning
- Personalized connection message drafts
- Relationship health indicators (haven't interacted in 3 months)

**Opportunity Matching:**
- Surface business opportunities relevant to company profile
- Investment match notifications for founders
- Event recommendations with reason ("3 of your connections are attending")

**Campaign & Promotion:**
- Audience targeting recommendations for promoted posts
- Optimal posting time suggestions
- Campaign performance explanations

**Guided Onboarding:**
- Step-by-step profile builder with AI prompts
- "First 5 actions" wizard for new users
- Platform feature discovery tooltips

### 12.2 AI Architecture Notes

- All AI features use Claude API (claude-sonnet-4-20250514) as the engine
- Prompts are constructed server-side with user context
- Rate-limited to prevent abuse
- Responses streamed for UX responsiveness
- User can always dismiss or override AI suggestions

---

## 13. Promotion & Visibility Engine

### 13.1 What Can Be Promoted

| Entity | Promotion Type |
|---|---|
| User Profile | Boost profile visibility in searches |
| Company Page | Sponsored company listing |
| Post / Article | Sponsored post in feed |
| Event | Promoted event listing |
| Job Listing | Sponsored job in job feed |
| Opportunity | Boosted opportunity listing |

### 13.2 Campaign Creation Flow

1. Select what to promote (post / page / event / etc.)
2. Define objective (reach / clicks / profile views / event registrations)
3. Define audience:
   - Industry
   - Job title / function
   - Location
   - Experience level
   - Skills
   - Company size
   - Followers of a competitor (future)
4. Set budget:
   - Daily budget or total budget
   - Start date / End date
   - Bid type (CPM / CPC)
5. Preview ad placement
6. Submit → review → go live

### 13.3 Campaign Management Dashboard

- Active / Paused / Completed campaigns list
- Per-campaign metrics: Impressions, Clicks, CTR, Spend, Conversions
- Pause / Resume / Edit / Duplicate campaign
- A/B testing between two creative variants
- Budget alert notifications

### 13.4 Organic Visibility Tools

- Profile SEO fields (keywords in headline, about, skills)
- Hashtag strategy (trending hashtag feed)
- Article indexing (platform articles are SEO-indexed pages)
- Featured section on profile (pin top content)
- Creator mode (boosts organic reach for consistent posters)

---

## 14. Advertising, Offers & Coupon Engine

### 14.1 Overview

Businesses can purchase advertising credits and receive promotional value bonuses.

### 14.2 Example Offer Logic

- **Spend ₹60,000 → Receive ₹1,20,000 promotional value** (2x bonus)
- Promotional bonus validity: limited to 3 months
- Bonus credited to advertising wallet, not withdrawable as cash

### 14.3 Coupon System

- Auto-generation of coupon codes for campaigns
- Offer rules engine:
  - Condition: spend X → receive Y
  - Condition: first-time advertiser → 50% bonus
  - Condition: event promotion category → 20% extra reach
- Coupon code entry at campaign checkout
- One coupon per campaign
- Coupon expiry enforced

### 14.4 Advertising Wallet

- Each company has an ad wallet balance
- Deposit via payment gateway
- Bonus credits separated from real credits (UI shows breakdown)
- Spending history log
- Auto top-up option
- Low balance alerts

### 14.5 Required System Components

- Auto coupon generation engine
- Offer rules evaluation engine
- Expiry management (cron job for expired credit removal)
- Wallet / credit tracking ledger
- Usage analytics dashboard
- Campaign redemption history

---

## 15. Growth, Referral & Reward System

### 15.1 Referral Code System

- Every verified user receives a unique referral code + shareable link
- Referral attribution is tracked via URL parameter + cookie fallback
- Anti-fraud: same device/IP checks, face verification must be new
- Referral is credited only when referred user completes face verification

### 15.2 Referral Dashboard (User)

- Personal referral code display
- Shareable link with copy button
- Count of successful referrals
- Pending referrals (registered but not verified yet)
- Rewards earned summary

### 15.3 Milestone Rewards

| Milestone | Reward |
|---|---|
| 100 Verified Joins | Gift Reward (voucher / merchandise) |
| 500 Verified Joins | Bigger Gift Reward |
| First & Fastest 1,000 Verified Joins | Mega Gift (latest flagship smartphone or equivalent) |

- Leaderboard: top 50 referrers by verified join count
- Real-time leaderboard updates
- Leaderboard resets per campaign season

### 15.4 Reward Engine Requirements

| Component | Requirement |
|---|---|
| Milestone Tracker | Auto-increment on each verified referral join |
| Eligibility Check | Auto-verify referral chain is valid, not self-referral, not fraudulent |
| Fraud Detection | IP analysis, device fingerprinting, face hash duplicate check |
| Referral Leaderboard | Redis-backed sorted set for real-time ranking |
| Notification System | Push + email when milestone hit |
| Admin Reward Management | Mark reward as dispatched, view reward queue |

### 15.5 Other Reward Mechanics

- Platform engagement XP points (future expansion)
- Badge system (Top Voice, Active Networker, Verified Founder, etc.)
- Promotional wallet credits for early adopter activity

---

## 16. Trust & Verification Engine

### 16.1 Personal Identity Claim Verification

**Problem:** How do we verify that the name a user claims is actually theirs?

**Solution Stack:**
- Identity verification logic: cross-check name against government ID (via third-party KYC API like DigiLocker / Aadhaar for India)
- Profile authenticity signals: email domain, professional history consistency
- Professional proof flow: optional upload of work ID / payslip
- Risk-based verification levels: low-risk profiles = self-declaration; high-risk (verified badge claimed) = document verification
- Manual review queue for flagged identities
- Impersonation prevention: detect high-profile name usage → trigger enhanced verification

### 16.2 Company Ownership Claim Verification

**Problem:** How do we verify a user is actually the owner of a company?

**Flow:**
1. User adds a company and selects "I am the owner"
2. System checks company domain: user must have email from that domain OR provide alternate proof
3. Business document upload: GST certificate / incorporation certificate
4. Official business registry check (MCA / Dun & Bradstreet API)
5. Admin approval workflow for borderline cases
6. Role claim verification: owner vs employee vs admin role logic

### 16.3 Event Authenticity & Post-Payment Trust

**Problem:** Paid events may be fake, manipulated, or cancelled unfairly.

**Controls:**
- Organizer must be face-verified + company-verified for paid events
- Event approval scoring by trust engine before going live
- Refund / escrow model: payment held in escrow until event completion
- Cancellation policy enforcement (auto-refund triggers)
- Fraud reporting flow: attendees can flag during or after event
- Moderation review queue for flagged events

### 16.4 Direct Owner-to-Investor Trust

**Problem:** In investment flows, false middlemen or brokers may intercept.

**Controls:**
- Only verified founders can initiate investment opportunities
- Authorized representative mapping: if not the founder, must be explicitly mapped
- Direct communication controls: investor messages go only to verified primary contact
- Escalation checkpoints: platform flags multi-party chains
- Investment trust indicators displayed on profiles
- Anti-broker safeguards: platform prohibits claiming broker fees through the platform

### 16.5 Trust Signals Displayed on Profiles

- ✅ Face Verified
- ✅ Identity Verified (KYC)
- 🏢 Company Verified
- 👤 Profile Completeness %
- ⭐ Average rating (for service providers)
- 🤝 Mutual connections count
- 📅 Member since date
- 🔗 Linked social accounts (GitHub, Twitter, etc.)

---

## 17. Search & Discovery

### 17.1 Global Search

Search bar accessible from every page. Returns results across:

- People
- Companies
- Jobs
- Events
- Opportunities
- Posts / Articles
- Skills / Topics

### 17.2 People Search Filters

- Name / keyword
- Job title
- Company (current or past)
- Industry
- Location
- Skills
- Connection degree (1st / 2nd / 3rd+)
- Open to work
- Open to connect

### 17.3 Company Search Filters

- Company name
- Industry
- Company size
- Location
- Verified only toggle

### 17.4 Job Search Filters

- Keywords
- Location
- Remote / Hybrid / On-site
- Experience level
- Industry
- Salary range
- Date posted (24h / 1 week / 1 month)
- Easy Apply only
- Company size

### 17.5 Search Infrastructure

- Full-text search via Elasticsearch or MongoDB Atlas Search
- Typeahead / autocomplete for names and companies
- Search result ranking considers: relevance score, connection degree, verification status, recency
- Saved searches with alert notifications
- Search analytics (track popular queries for platform insights)

---

## 18. Messaging & Communication

### 18.1 Direct Messaging

- Only available between 1st-degree connections (default)
- Message request system for non-connections (InMail equivalent)
- Character limit: 2000 per message
- Supports: text, emoji, file attachments (PDF, images), links

### 18.2 Message Thread Features

- Read receipts (with privacy toggle to disable)
- Typing indicators
- Message reactions (emoji)
- Reply to specific message (quote reply)
- Delete for me / delete for everyone
- Pin important messages in thread

### 18.3 Message Requests

- Non-connections can send 1 message request
- Recipient can: Accept (unlocks thread), Decline, Report as spam
- Companies can receive unlimited inbound message requests

### 18.4 Group Messaging

- Create a group with up to 50 members
- Group name and avatar
- Add/remove members (admin only)
- Group admin controls

### 18.5 Notification & Unread State

- Unread badge count in nav
- Push notification for new messages
- Email digest for unread messages (configurable)
- Do Not Disturb mode with scheduled quiet hours

---

## 19. Notifications System

### 19.1 Notification Types

| Category | Triggers |
|---|---|
| Connections | New request, accepted, mutual connection joined |
| Content | Like, comment, reply, mention, share of post |
| Jobs | Application status change, new matching job, applicant applied |
| Events | Registration confirmed, event reminder, organizer update, event cancelled |
| Referrals | New referral joined, milestone achieved, reward dispatched |
| Messages | New message, message request received |
| Opportunities | Match found, company expressed interest |
| Platform | Profile viewed (summary), verification status updated |
| Admin | Account warnings, content removed |

### 19.2 Notification Delivery Channels

- In-app notification bell (real-time via WebSocket)
- Email (configurable per category)
- Push notifications (mobile PWA / app)
- SMS for critical actions (payment, suspicious login)

### 19.3 Notification Preferences

Users can toggle each category on/off per channel (in-app / email / push).

---

## 20. Analytics & Reporting

### 20.1 Individual Profile Analytics

- Profile views (last 7 days, 30 days, 90 days trend)
- Search appearances count
- Post impressions and engagement
- Connection growth chart
- Top locations / industries viewing your profile

### 20.2 Company Page Analytics

- Follower count and growth
- Employee count (linked profiles)
- Post engagement per post
- Job listing views and application rates
- Profile views by industry, seniority, location
- Ad campaign performance summary

### 20.3 Event Analytics

- Views of event page
- Registration funnel (views → registered → attended)
- Attendee demographics
- Revenue (for paid events)
- Post-event survey results

### 20.4 Platform-level Admin Analytics

- Daily / weekly / monthly active users
- New registrations trend
- Face verification pass/fail rates
- Job postings vs applications ratio
- Top companies / users by engagement
- Revenue from advertising
- Referral conversion rates
- Feature usage heatmap

---

## 21. Admin Panel & Moderation

### 21.1 Admin Capabilities

**User Management:**
- Search users by email, name, ID
- View full profile and activity log
- Manually verify / unverify
- Suspend / ban / reinstate
- Reset face verification
- Merge duplicate accounts

**Content Moderation:**
- Review flagged posts, comments, messages
- Remove content with reason code
- Warn user
- Escalate to senior review

**Company Verification:**
- Review pending verification requests
- Approve / reject with notes
- Request additional documents

**Event Moderation:**
- Review flagged events
- Force-cancel with attendee notification
- Trigger refunds for cancelled paid events

**Referral & Reward Management:**
- View referral chains
- Flag suspicious referral clusters
- Dispatch / mark rewards as fulfilled
- Blacklist fraudulent referral accounts

**Ad Campaign Review:**
- Review ads before they go live (optional pre-moderation)
- Pause live ads that violate policy
- View ad spend ledger

### 21.2 Moderation Queue

- Priority queue sorted by severity + report count
- Filter by type (profile / post / event / message)
- Bulk actions (approve many, reject many)
- Audit log of all admin actions

---

## 22. Database Schema Design

### 22.1 MongoDB Collections Overview

```
users
  _id, email, passwordHash, roles[], verificationStatus,
  faceEmbeddingHash, createdAt, lastLoginAt, isDeleted

profiles
  _id, userId (ref), firstName, lastName, headline, location,
  about, profilePhoto, coverPhoto, websiteUrl,
  experience[], education[], skills[], certifications[],
  projects[], publications[], openToWork, openToCollaborate,
  completenessScore, updatedAt

companies
  _id, name, slug, ownerId (ref), logo, coverPhoto,
  tagline, industry, size, foundedYear, location, website,
  about, specialties[], verificationStatus, verifiedAt,
  followerCount, linkedEmployeeCount, createdAt

connections
  _id, requesterId (ref), recipientId (ref), status,
  [PENDING | CONNECTED | DECLINED | BLOCKED],
  createdAt, updatedAt

posts
  _id, authorId (ref), authorType [USER|COMPANY],
  type [TEXT|IMAGE|VIDEO|ARTICLE|POLL|...],
  content, mediaUrls[], hashtags[], mentions[],
  visibility, likeCount, commentCount, shareCount,
  isPromoted, createdAt, updatedAt, isDeleted

comments
  _id, postId (ref), authorId (ref), parentCommentId (ref),
  content, likeCount, createdAt, isDeleted

reactions
  _id, userId (ref), targetId, targetType [POST|COMMENT],
  type [LIKE|CELEBRATE|SUPPORT|INSIGHTFUL|FUNNY], createdAt

jobs
  _id, companyId (ref), postedBy (ref), title, description,
  location, type, experienceMin, salary{min,max,currency},
  skills[], industry, department, applicationDeadline,
  openings, easyApply, status [ACTIVE|PAUSED|CLOSED],
  applicationCount, createdAt, updatedAt

applications
  _id, jobId (ref), applicantId (ref), status
  [APPLIED|VIEWED|SHORTLISTED|INTERVIEW|OFFERED|HIRED|REJECTED],
  coverLetter, resumeUrl, answers[], appliedAt, updatedAt

events
  _id, organizerId (ref), organizerType, title, type,
  description, bannerUrl, startTime, endTime, timezone,
  locationType [ONLINE|INPERSON|HYBRID], venue, onlineLink,
  tickets[{type, price, qty, remaining}],
  registrationCount, status [DRAFT|ACTIVE|CANCELLED|COMPLETED],
  createdAt

registrations
  _id, eventId (ref), userId (ref), ticketType, ticketQR,
  paymentStatus, amount, checkedIn, createdAt

opportunities
  _id, posterId (ref), posterType, title, type, description,
  budget{min,max}, industry, location, deadline,
  contactMethod, attachments[], status, createdAt

messages
  _id, threadId (ref), senderId (ref), content,
  attachments[], readBy[], createdAt, isDeleted

threads
  _id, participants[], type [DIRECT|GROUP], groupName,
  groupAvatar, lastMessage, lastMessageAt, createdAt

notifications
  _id, recipientId (ref), type, referenceId, referenceType,
  message, isRead, createdAt

referrals
  _id, referrerId (ref), refereeId (ref), code,
  status [PENDING|VERIFIED|REWARDED], createdAt, verifiedAt

ad_campaigns
  _id, advertiserId (ref), advertiserType,
  targetEntity, targetEntityId, objective,
  audience{}, budget, startDate, endDate,
  status, impressions, clicks, spend, createdAt

ad_wallet
  _id, ownerId (ref), ownerType,
  balance, bonusBalance, transactions[], updatedAt

service_projects
  _id, clientId (ref), title, description, category,
  budget{min,max}, timeline, skills[], status
  [OPEN|IN_NEGOTIATION|ACTIVE|COMPLETED|DISPUTED], createdAt

proposals
  _id, projectId (ref), vendorId (ref), coverLetter,
  price, timeline, status [PENDING|ACCEPTED|REJECTED], createdAt

milestones
  _id, projectId (ref), title, description, dueDate,
  status [PENDING|IN_PROGRESS|SUBMITTED|APPROVED|REVISION], createdAt
```

---

## 23. API Architecture

### 23.1 RESTful API Structure

```
/api/v1/

AUTH
  POST   /auth/register
  POST   /auth/login
  POST   /auth/logout
  POST   /auth/verify-email
  POST   /auth/face-verify
  POST   /auth/refresh-token
  POST   /auth/forgot-password
  POST   /auth/reset-password

USERS / PROFILES
  GET    /users/:id
  PUT    /users/:id/profile
  GET    /users/:id/connections
  GET    /users/:id/followers
  POST   /users/:id/follow
  DELETE /users/:id/follow
  GET    /users/recommendations

COMPANIES
  GET    /companies/:id
  POST   /companies
  PUT    /companies/:id
  POST   /companies/:id/verify
  GET    /companies/:id/jobs
  GET    /companies/:id/posts

CONNECTIONS
  POST   /connections/request
  PUT    /connections/:id/respond
  DELETE /connections/:id
  POST   /connections/:id/block

POSTS
  GET    /feed
  POST   /posts
  GET    /posts/:id
  PUT    /posts/:id
  DELETE /posts/:id
  POST   /posts/:id/react
  DELETE /posts/:id/react
  POST   /posts/:id/comments
  GET    /posts/:id/comments
  POST   /posts/:id/share

JOBS
  GET    /jobs
  POST   /jobs
  GET    /jobs/:id
  PUT    /jobs/:id
  DELETE /jobs/:id
  POST   /jobs/:id/apply
  GET    /jobs/:id/applicants
  PUT    /jobs/:id/applicants/:appId/status

EVENTS
  GET    /events
  POST   /events
  GET    /events/:id
  PUT    /events/:id
  DELETE /events/:id
  POST   /events/:id/register
  GET    /events/:id/attendees
  POST   /events/:id/check-in

OPPORTUNITIES
  GET    /opportunities
  POST   /opportunities
  GET    /opportunities/:id
  POST   /opportunities/:id/interest

MESSAGES
  GET    /threads
  GET    /threads/:id/messages
  POST   /threads/:id/messages
  POST   /threads
  PUT    /threads/:id/read

NOTIFICATIONS
  GET    /notifications
  PUT    /notifications/read-all
  PUT    /notifications/:id/read

SEARCH
  GET    /search?q=&type=&filters=

AI
  POST   /ai/profile-suggestions
  POST   /ai/post-suggestions
  POST   /ai/job-match-explanation
  POST   /ai/opportunity-match
  POST   /ai/campaign-recommendations

REFERRALS
  GET    /referrals/my-code
  GET    /referrals/stats
  GET    /referrals/leaderboard

AD CAMPAIGNS
  POST   /ads/campaigns
  GET    /ads/campaigns
  PUT    /ads/campaigns/:id
  GET    /ads/wallet
  POST   /ads/wallet/deposit
  POST   /ads/coupons/apply

ADMIN
  GET    /admin/users
  PUT    /admin/users/:id/status
  GET    /admin/moderation-queue
  PUT    /admin/moderation/:id/action
  GET    /admin/analytics
```

### 23.2 WebSocket Events

```
connection:new-request
connection:accepted
message:new
notification:new
post:new-reaction
post:new-comment
feed:refresh-signal
presence:online
presence:typing
```

### 23.3 API Standards

- All endpoints return `{ success, data, error, meta }` envelope
- Pagination: cursor-based for feeds, offset for admin lists
- Rate limiting: per-user per-endpoint (Redis-backed)
- JWT access tokens (15 min expiry) + refresh tokens (7 days)
- All requests over HTTPS only

---

## 24. Security Requirements

### 24.1 Authentication Security

- Bcrypt password hashing (cost factor 12)
- JWT signed with RS256
- Refresh token rotation on each use
- Brute force protection: lock after 5 failed logins
- Suspicious login detection (new device / location) → email alert

### 24.2 Data Security

- All PII encrypted at rest (AES-256)
- Face embeddings: stored as hashed vectors only, never raw biometrics
- HTTPS/TLS 1.3 for all traffic
- Helmet.js headers (CSP, HSTS, X-Frame-Options, etc.)
- Input validation and sanitization on all endpoints (Zod schemas)
- SQL/NoSQL injection prevention via parameterized queries / Mongoose
- XSS protection via output encoding

### 24.3 Access Control

- Role-based access control (RBAC) middleware on all routes
- Resource-level ownership checks (you can only edit your own post)
- Admin routes protected by separate admin JWT claim
- Company admin actions require company admin role claim

### 24.4 File Upload Security

- Virus scanning on all file uploads (ClamAV or cloud equivalent)
- File type whitelist (PDF, JPG, PNG, MP4)
- File size limits per type
- Files stored in cloud storage (GCS), never on server disk
- Signed URLs for private file access

### 24.5 Anti-Fraud

- Rate limiting on referral claims
- Device fingerprinting for referral fraud detection
- IP velocity checks on registration
- Duplicate face hash detection across accounts
- Honeypot fields in registration form to catch bots

---

## 25. Tech Stack

### 25.1 Recommended Stack

| Layer | Technology |
|---|---|
| Frontend | Remix.js |
| Backend | Fastify (preferred) or any high-performance Node.js backend |
| Database | MongoDB |
| Infrastructure | Google Cloud Run |
| File Storage | Google Cloud Storage |
| Cache | Redis (sessions, rate limiting, leaderboard) |
| Search | MongoDB Atlas Search / Elasticsearch |
| Real-time | Socket.io over WebSocket |
| Email | Resend / SendGrid |
| AI | Anthropic Claude API (claude-sonnet-4-20250514) |
| Face Verification | FaceIO / AWS Rekognition / Custom liveness model |
| Payments | Razorpay (India) / Stripe |
| Queue | BullMQ (Redis-backed) for async jobs |
| Monitoring | Google Cloud Monitoring + Sentry |

### 25.2 Alternative Stack Acceptance Criteria

If using a different stack, it must satisfy:

- ✅ High performance under concurrent load
- ✅ Scalable horizontally (stateless services)
- ✅ Secure (follows OWASP top 10 mitigations)
- ✅ Supportable (active community, not deprecated)
- ✅ Extensible (easy to add features post-hackathon)

### 25.3 Infrastructure Architecture

```
[Client: Remix.js SPA/SSR]
        |
[CDN: Cloudflare]
        |
[API Gateway / Load Balancer]
        |
[Cloud Run Services]
   |              |
[Fastify API]   [Socket.io Server]
   |              |
[MongoDB Atlas] [Redis]
   |
[GCS: File Storage]
   |
[BullMQ Workers: Email, AI, Notifications, Verification]
```

---

## 26. Testing Strategy

### 26.1 Test Coverage Requirements

**Unit Tests**
- All utility functions
- Validation schemas
- Business logic services (matching, scoring, fraud detection)
- AI prompt construction functions

**Integration Tests**
- All API endpoints (happy path + error cases)
- Authentication flows end-to-end
- Database operations with real test MongoDB instance
- File upload flows

**End-to-End Tests**
- User registration + face verification flow
- Post creation and feed rendering
- Job application flow (post job → apply → status change)
- Event creation → registration → check-in
- Referral → verified join → milestone reward

**Edge Cases to Cover**
- Duplicate email registration
- Face verification with fake/spoofed face (reject)
- Applying to a job with incomplete profile
- Event cancellation refund trigger
- Referral self-referral prevention
- Message to a blocked user

### 26.2 Test Framework

- **Backend:** Jest + Supertest for API tests
- **Frontend:** Playwright for E2E, Vitest for unit
- **Coverage threshold:** Minimum 70% line coverage overall; 90% for auth and verification modules

### 26.3 Documentation Requirements

Teams must document:

- **Assumptions:** What is assumed about user behavior, data availability, third-party APIs
- **Scope Limitations:** What is partially implemented or mocked
- **Testing Strategy Document:** Summary of test plan, what is covered and what is not

---

## 27. Evaluation Checklist

| Criterion | Status |
|---|---|
| Consistent and thoughtful UI/UX | |
| Clear and logical user flows | |
| Meaningful integration between modules | |
| Clean database design | |
| Scalable backend architecture | |
| Code quality and maintainability | |
| Functional completeness | |
| Fast and accurate verification systems | |
| Innovation and usability | |
| Testing quality | |
| Overall product readiness | |
| Innovative mindset and creative problem solving | |
| SEO-friendly implementation | |
| Strong security implementation | |
| Proper test coverage | |
| Smart growth and referral mechanics | |

---

## Appendix A — Feature Priority Matrix

| Feature | Priority | Complexity | MVP? |
|---|---|---|---|
| Auth + Face Verification | P0 | High | ✅ |
| User Profile (Individual) | P0 | Medium | ✅ |
| Feed + Posts | P0 | Medium | ✅ |
| Connections + Networking | P0 | Medium | ✅ |
| Job Posting + Application | P0 | High | ✅ |
| Company Profile | P0 | Medium | ✅ |
| Events (Create + Register) | P1 | High | ✅ |
| Search & Discovery | P1 | Medium | ✅ |
| Messaging | P1 | High | ✅ |
| AI Assistance | P1 | High | ✅ |
| Referral + Reward System | P1 | Medium | ✅ |
| Trust & Verification Engine | P1 | Very High | ✅ |
| Promotion + Ad Campaigns | P2 | High | ⚠️ |
| B2B Service Collaboration | P2 | High | ⚠️ |
| Business Opportunity Marketplace | P2 | Medium | ⚠️ |
| Admin Panel | P2 | Medium | ⚠️ |
| Advanced Analytics | P3 | Medium | ❌ |
| Coupon Engine | P3 | Medium | ❌ |

---

## Appendix B — User Story Examples

### Story 1: Face Verification
> As a new user, when I complete registration, I must complete face verification using my live camera before I can access any core features, so the platform maintains a community of real humans.

### Story 2: Job Application
> As a verified professional, I want to apply to a job posting with one click using my profile, so I can quickly express interest without rebuilding my resume.

### Story 3: Event Hosting
> As a company, I want to create a paid event with ticket tiers, so I can monetize my startup showcase and manage attendee registration from one dashboard.

### Story 4: Referral Growth
> As a user, I want to share my referral link on social media, so when my contacts sign up and verify, I accumulate referrals toward milestone rewards.

### Story 5: B2B Collaboration
> As a tech company, I want to post a project requirement and receive proposals from other companies, so I can outsource specialized work through a structured procurement flow.

---

*Document prepared for hackathon build reference. Last updated: April 2026.*
