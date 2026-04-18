# KaaMe Backend — Jobs Module

> Part of the KaaMe trusted professional ecosystem. Sahil owns the Feed module, Gurukant owns Marketplace, and **Akshar owns Jobs + Events**.

---

## Project Structure

```
backend/src/
├── index.ts                        # Fastify entry point (register all modules here)
├── config/
│   └── db.ts                       # Mongoose connection singleton
├── middleware/
│   ├── auth.ts                     # JWT decode → attaches user context to request
│   └── requireRole.ts              # Role-based access preHandler factory
├── models/                         # Shared Mongoose models (Feed module)
│   ├── User.ts
│   ├── Company.ts
│   ├── Profile.ts                  # Used for experience calculation on apply
│   └── ...
└── modules/
    └── jobs/
        ├── jobs.schema.ts          # All Mongoose schemas + indexes
        ├── jobs.validation.ts      # Zod schemas for every route
        ├── jobs.errors.ts          # Typed error codes + JobError class
        ├── jobs.service.ts         # Business logic (pure, no HTTP context)
        ├── jobs.controller.ts      # Request handlers (thin, delegates to service)
        └── jobs.routes.ts          # Fastify route registration
```

---

## Setup & Run

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env` and fill in:

```env
PORT=3001
MONGO_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_URL=                    # optional: for resume upload
NODE_ENV=development
```

### 3. Run in development
```bash
npm run dev
```

---

## API Reference — `/api/v1/jobs`

### Public (No Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search` | Search published jobs with filters |
| GET | `/listings/:jobOrSlugId` | Full job detail (by id or slug) |
| GET | `/categories` | Job categories as a tree |
| GET | `/skills/search?q=` | Typeahead skill search |

**Search query params:** `q`, `categoryId`, `jobType`, `workMode`, `city`, `minExp`, `maxExp`, `page`, `limit` (max 50)

---

### Company / Recruiter Routes (Auth + Company JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/listings` | Create a job listing (draft) |
| PATCH | `/listings/:jobId` | Update draft/paused listing |
| POST | `/listings/:jobId/publish` | Publish listing |
| POST | `/listings/:jobId/pause` | Pause listing |
| POST | `/listings/:jobId/close` | Close listing |
| DELETE | `/listings/:jobId` | Soft-delete listing |
| GET | `/company/:companyId/listings` | Get company's listings (filter: `status`, `page`, `limit`) |
| GET | `/listings/:jobId/applications` | View applications for a job (filter: `stage`, `page`, `limit`) |
| PATCH | `/applications/:applicationId/stage` | Move application stage |
| POST | `/listings/:jobId/invite` | Invite a specific user to apply |

**Stage transitions:**  
`applied → shortlisted → interviewing → offered → hired`  
Any active stage → `rejected`

---

### Candidate Routes (Auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/listings/:jobId/apply` | Apply to a job |
| GET | `/my-applications` | View own applications (no recruiter notes) |
| POST | `/listings/:jobId/save` | Save a job |
| DELETE | `/listings/:jobId/save` | Unsave a job |
| GET | `/saved` | List saved jobs |
| GET | `/my-invitations` | View received invitations |
| PATCH | `/invitations/:invitationId` | Accept/decline invitation |

---

## Domain Rules Enforced

1. **Company verification**: Only companies with `verificationStatus === "verified"` can post jobs.
2. **Experience gate**: `totalExperienceMonths >= 12` — computed from `Profile.experience[]` on apply.
3. **Face verification**: `User.faceVerified === true` required to apply and save.
4. **No duplicate applications**: Unique index on `(jobId, applicantId)`.
5. **Status machine**: `draft → published → paused → closed/expired`. Edit only on `draft` or `paused`.
6. **Boosted jobs rank first** in search results.
7. **Recruiter notes** are never exposed to candidates in `GET /my-applications`.

---

## Error Response Format

All errors follow this consistent shape:

```json
{
  "success": false,
  "error": {
    "code": "JOB_NOT_FOUND",
    "message": "No published job found with the given id or slug."
  }
}
```

**Error codes:** `JOB_NOT_FOUND`, `JOB_NOT_PUBLISHED`, `COMPANY_NOT_VERIFIED`, `USER_NOT_FACE_VERIFIED`, `INSUFFICIENT_EXPERIENCE`, `DUPLICATE_APPLICATION`, `UNAUTHORIZED`, `INVITATION_EXPIRED`, `APPLICATION_DEADLINE_PASSED`, `VALIDATION_ERROR`, `INVALID_STATUS_TRANSITION`, `LISTING_NOT_EDITABLE`

---

## JWT Payload Expected

The auth middleware (`src/middleware/auth.ts`) expects a JWT with this payload:

```json
{
  "userId": "mongo_object_id",
  "companyId": "mongo_object_id_or_null",
  "isVerified": true,
  "faceVerified": true,
  "role": "owner | admin | recruiter | member"
}
```
