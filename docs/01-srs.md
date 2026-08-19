# 01 — Software Requirements Specification

## 1. Scope
UBIRR captures, organises, governs, and disseminates digital resources for the University of Zambia. It serves staff, students, a core content team, CICT administrators, and the general public.

## 2. Functional Requirements

### 2.1 Authentication & User Management
- FR-A1 Users sign in with email and password.
- FR-A2 Passwords are hashed and checked against the Have-I-Been-Pwned database on creation.
- FR-A3 Administrators create accounts; default new accounts hold the **Student** role.
- FR-A4 Administrators may assign, revoke, or combine roles per user.
- FR-A5 Password reset by email link.
- FR-A6 Session timeout enforced by Auth provider (default 1 hour rolling).
- FR-A7 Failed sign-in attempts are rate-limited by the Auth provider.

### 2.2 Roles & Access
Roles: `super_admin`, `project_admin`, `content_manager`, `digitization_officer`, `reviewer`, `staff`, `student`, plus unauthenticated `public`.
Access levels per content item: `public`, `university`, `staff`, `student`, `core_team`, `draft`. See [Roles & Permissions](./02-roles-permissions-matrix.md).

### 2.3 Content Management
- FR-C1 Authorised users create, edit, and delete content items of any supported type (article, video, audio, pdf, image, gallery, digitized, academic, educational, biosafety, announcement, page, event).
- FR-C2 Each item carries: title, slug, summary, body, type, category, department, author, access level, status, copyright, licence, language, keywords, publish date, expiry date.
- FR-C3 Items move through states: `draft → submitted → (returned|rejected|approved) → published → archived`.
- FR-C4 Only `project_admin` / `super_admin` may publish or archive.
- FR-C5 Authors may edit only their own `draft` or `returned` items.
- FR-C6 Full-text search on title, summary, body, and keywords.

### 2.4 Files & Media
- FR-F1 Upload video (MP4/WebM/MOV), audio (MP3/WAV/M4A), documents (PDF), images (JPG/PNG/WebP).
- FR-F2 Files are validated by MIME type, extension, and size against the configured `max_upload_mb`.
- FR-F3 Files are stored in the `content-files` private bucket; access is granted via short-lived signed URLs.
- FR-F4 File metadata (size, checksum, version, uploader) is recorded in `content_files`.

### 2.5 Digitization
- FR-D1 Officers record hard-copy items pending digitization.
- FR-D2 Workflow states: `pending → scanning → scanned → ocr_done → metadata_added → under_review → approved → published`; or `rejected` / `rescan`.
- FR-D3 OCR text is captured as plain text for search.
- FR-D4 Approved digitised items may be linked to a public-facing content item.

### 2.6 Events
- FR-E1 Authorised users create University events with date/time, venue, organiser, description, banner, registration link.
- FR-E2 Published public events appear on `/events` and the homepage.

### 2.7 Search & Discovery
- FR-S1 Public visitors search and filter the published, public portion of the library.
- FR-S2 Filters: content type, category, department, tag, access level (admin only), date range.
- FR-S3 Search uses a PostgreSQL `tsvector` GIN index for sub-second response on tens of thousands of items.

### 2.8 Approval Workflow
- FR-W1 Each transition writes a row to `approval_workflows` with actor, timestamps, and comments.
- FR-W2 Reviewers may approve, return with comments, or reject.
- FR-W3 Notifications appear in the recipient's dashboard.

### 2.9 Audit Trail
- FR-AU1 Every privileged mutation writes to `audit_logs` (actor, action, entity, IP if available, timestamp).
- FR-AU2 Only administrators may read audit logs.

### 2.10 Reporting
- FR-R1 Dashboard counts: total / published / draft / pending / archived items, events, digitisation records.
- FR-R2 Most recent activity feed (last 8 items).
- FR-R3 Future: most viewed, most downloaded, storage usage by bucket.

### 2.11 System Settings
- FR-SS1 Administrators edit branding name, contact email, max upload size, default access level, and other key/value settings via the Settings page.

## 3. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | HTTPS-only; HSTS enabled at edge |
| NFR-2 | RLS enforced on every table holding user-scoped or governed data |
| NFR-3 | p95 page load < 2 s on broadband |
| NFR-4 | Search response < 500 ms for ≤ 50 000 items |
| NFR-5 | Storage horizontally scalable via S3-compatible object storage |
| NFR-6 | WCAG 2.1 AA contrast, keyboard navigation throughout |
| NFR-7 | Mobile responsive ≥ 360 px width |
| NFR-8 | Backup RPO ≤ 24 h, RTO ≤ 4 h (see [Backup & DR](./08-backup-dr.md)) |
| NFR-9 | Audit log retention ≥ 2 years |
| NFR-10 | No secrets in source; configuration via environment variables |
