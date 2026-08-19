# UNZA Sanitation Hub — Technical Documentation

**Version:** 1.0  
**Date:** July 2026  
**System:** UNZA Decentralized Sanitation Systems Hub & Laboratory Repository  
**Prepared for:** University of Zambia — Department of Civil Engineering

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Database Schema](#4-database-schema)
5. [Authentication & Security](#5-authentication--security)
6. [API Reference](#6-api-reference)
7. [File Storage System](#7-file-storage-system)
8. [Content Workflow](#8-content-workflow)
9. [Role & Permission Model](#9-role--permission-model)
10. [Configuration Reference](#10-configuration-reference)
11. [Deployment Guide](#11-deployment-guide)
12. [Development Setup](#12-development-setup)

---

## 1. System Overview

The UNZA Sanitation Hub is a full-stack web platform serving as the national knowledge hub for decentralized sanitation systems in Zambia. It combines a public-facing resource library, event calendar, demonstration site registry, and training management system with a full administrative backend for content lifecycle management.

### Core Functions

| Function | Description |
|----------|-------------|
| Resource Library | Upload, categorize, search, and download research papers, reports, policies, training materials, and multimedia |
| Content Workflow | Structured draft → review → publish pipeline with approval management |
| Events | Create and publish conferences, workshops, and symposia |
| Training Sessions | Register for and manage capacity-building sessions |
| Demonstration Sites | Geographic registry of decentralized sanitation installations |
| Digitization | Track physical-to-digital archiving of legacy documents |
| Analytics | View counts, download records, user activity reporting |
| User Management | Role-based access with UNZA LDAP, Student Portal, HR Portal, and email authentication |

---

## 2. Technology Stack

### Backend

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Spring Boot | 3.4.6 |
| Language | Java | 21 (LTS) |
| Database | PostgreSQL | 14+ |
| Cache | Redis | 7+ |
| ORM | Hibernate / Spring Data JPA | 6.x |
| Security | Spring Security | 6.x |
| Authentication | JWT (HS256) + LDAP + OAP + HR |
| Build Tool | Maven | 3.9+ |
| File Storage | Local Filesystem (configurable path) |
| Email | JavaMail / SMTP |

### Frontend

| Component | Technology |
|-----------|-----------|
| Framework | React 18 |
| Router | TanStack Router (file-based, SSR-capable) |
| Data Fetching | TanStack Query |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Icons | Lucide React |
| Fonts | Inter (sans), Source Serif 4 (display) |
| Build | Vite / TanStack Start |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Browser                       │
│              React SPA (TanStack Router)                 │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS / REST JSON
┌──────────────────────▼──────────────────────────────────┐
│               Spring Boot Backend (:8080)                │
│                                                          │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────────┐  │
│  │ Controllers│  │  Services   │  │  Repositories    │  │
│  │ /api/auth  │  │ AuthService │  │ AppUserRepo      │  │
│  │ /api/public│  │ AdminService│  │ ContentItemRepo  │  │
│  │ /api/admin │  │ PublicSvc   │  │ EventRepo        │  │
│  │ /api/account│ │ StorageSvc  │  │ ...              │  │
│  │ /api/files │  │ AuditSvc    │  └──────────────────┘  │
│  └────────────┘  └─────────────┘                        │
│                                                          │
│  ┌──────────────────┐  ┌─────────────────────────────┐  │
│  │ Security Layer   │  │       Storage               │  │
│  │ JWT Filter       │  │  ./storage/content-files/   │  │
│  │ Spring Security  │  │  ./storage/thumbnails/      │  │
│  │ CORS Config      │  │  ./backups/                 │  │
│  └──────────────────┘  └─────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │
          ┌────────────┴───────────┐
          │                        │
┌─────────▼──────┐      ┌─────────▼──────┐
│  PostgreSQL DB  │      │   Redis Cache  │
│  :5432          │      │   :6379        │
│  sanitation_hub │      │  JWT revocation│
│                 │      │  Rate limiting │
└─────────────────┘      └────────────────┘
```

### Request Flow

1. Browser sends HTTP request with `Authorization: Bearer <JWT>` header
2. `JwtAuthenticationFilter` extracts and validates token
3. User entity loaded from DB with roles (JOIN FETCH to avoid lazy loading)
4. `UserPrincipal` created and placed in Spring SecurityContext
5. Request dispatched to appropriate controller
6. Controller calls service method
7. Service enforces role check via `AuthContextService`
8. Service performs business logic and DB operations
9. Response serialized as JSON (snake_case naming via Jackson)
10. Response returned to client

---

## 4. Database Schema

### Entity Relationship Overview

```
AppUser ──< UserRoleAssignment
AppUser ──< ContentItem (author)
AppUser ──< ContentFile (uploadedBy)
AppUser ──< Bookmark
AppUser ──< ViewRecord
AppUser ──< DownloadRecord
AppUser ──< Notification
AppUser ──< ReadingList ──< ReadingListItem ──> ContentItem
AppUser ──< TrainingRegistration >── TrainingSession
AppUser ── Department >── School

ContentItem ──< ContentFile
ContentItem ──< ContentTag >── Tag
ContentItem >── Category
ContentItem >── Department
ContentItem ──< ApprovalWorkflow
ContentItem ── DigitizationRecord
```

### Table: users

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | UUID | NO | PK, auto-generated |
| email | VARCHAR | NO | UNIQUE |
| password_hash | VARCHAR | YES | NULL for SSO accounts |
| full_name | VARCHAR | NO | Default "" |
| phone | VARCHAR | YES | |
| unza_id | VARCHAR | YES | UNIQUE, LDAP/OAP/HR login |
| auth_type | VARCHAR | NO | LOCAL, LDAP, OAP, HR |
| affiliation | VARCHAR | YES | |
| institution | VARCHAR | YES | External users |
| job_title | VARCHAR | YES | |
| department_id | UUID | YES | FK → departments |
| school_id | UUID | YES | FK → schools |
| status | VARCHAR | NO | active, pending, suspended |
| last_login_at | TIMESTAMP | YES | |
| login_attempts | INT | NO | Default 0 |
| locked_until | TIMESTAMP | YES | Account lockout expiry |
| email_verified | BOOLEAN | NO | Default false |
| email_verification_token | VARCHAR | YES | UUID token |
| reset_token | VARCHAR | YES | SHA-256 hashed |
| reset_token_expires_at | TIMESTAMP | YES | |
| created_at | TIMESTAMP | NO | Auto-set |
| updated_at | TIMESTAMP | NO | Auto-updated |

**Indexes:** idx_users_email, idx_users_unza_id, idx_users_status, idx_users_auth_type

---

### Table: user_roles

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | UUID | NO | PK |
| user_id | UUID | NO | FK → users |
| role | VARCHAR | NO | SUPER_ADMIN, PROJECT_ADMIN, CONTENT_MANAGER, DIGITIZATION_OFFICER, REVIEWER, STAFF, STUDENT |
| created_at | TIMESTAMP | NO | |

---

### Table: content_items

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | UUID | NO | PK |
| title | VARCHAR | NO | |
| slug | VARCHAR | NO | UNIQUE |
| summary | TEXT | YES | |
| body | TEXT | YES | Rich HTML/Markdown |
| content_type | VARCHAR | NO | Free-text type slug |
| category_id | UUID | YES | FK → categories |
| department_id | UUID | YES | FK → departments |
| author_id | UUID | YES | FK → users |
| access_level | VARCHAR | NO | PUBLIC, UNIVERSITY, STAFF, STUDENT, CORE_TEAM, DRAFT |
| status | VARCHAR | NO | DRAFT, SUBMITTED, RETURNED, APPROVED, PUBLISHED, ARCHIVED, REJECTED |
| thumbnail_path | VARCHAR | YES | Relative storage path |
| downloadable | BOOLEAN | NO | Default true |
| copyright_status | VARCHAR | YES | |
| licence_information | VARCHAR | YES | |
| language | VARCHAR | YES | Default "en" |
| keywords | VARCHAR | YES | Comma-separated |
| authors | TEXT | YES | Display author names |
| publisher | VARCHAR | YES | |
| publication_date | DATE | YES | Original publication date |
| activity_date | DATE | YES | Event/activity date |
| source_institution | VARCHAR | YES | |
| external_identifier | VARCHAR | YES | DOI, ISBN, etc. |
| bibliographic_info | VARCHAR | YES | Volume/issue/pages |
| published_at | TIMESTAMP | YES | When published to live |
| expires_at | TIMESTAMP | YES | Auto-archive trigger |
| view_count | INT | NO | Default 0 |
| deleted_at | TIMESTAMP | YES | Soft-delete marker |
| created_at | TIMESTAMP | NO | |
| updated_at | TIMESTAMP | NO | |

**Indexes:** slug, status, content_type, access_level, published_at, category_id, department_id, author_id, deleted_at, (status + published_at)

---

### Table: content_files

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | UUID | NO | PK |
| content_item_id | UUID | NO | FK → content_items |
| original_file_name | VARCHAR | NO | |
| stored_file_name | VARCHAR | NO | UUID-based name |
| file_path | VARCHAR | NO | Relative storage path |
| file_type | VARCHAR | YES | "image", "application", etc. |
| mime_type | VARCHAR | YES | "application/pdf" |
| file_extension | VARCHAR | YES | "pdf", "docx" |
| file_size | BIGINT | YES | Bytes |
| checksum | VARCHAR | YES | SHA-256 |
| version_number | INT | NO | Default 1 |
| uploaded_by | UUID | YES | FK → users |
| access_level | VARCHAR | YES | Inherits from content |
| created_at | TIMESTAMP | NO | |
| updated_at | TIMESTAMP | NO | |

---

### Table: events

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | UUID | NO | PK |
| title | VARCHAR | NO | |
| slug | VARCHAR | NO | UNIQUE |
| description | TEXT | YES | |
| venue | VARCHAR | YES | |
| start_date | DATE | NO | |
| end_date | DATE | YES | |
| start_time | TIME | YES | |
| end_time | TIME | YES | |
| organizer | VARCHAR | YES | |
| department_id | UUID | YES | FK → departments |
| contact_email | VARCHAR | YES | |
| banner_image_path | VARCHAR | YES | |
| registration_link | VARCHAR | YES | External link |
| access_level | VARCHAR | NO | |
| status | VARCHAR | NO | |
| created_by | UUID | YES | FK → users |
| published_at | TIMESTAMP | YES | |
| created_at | TIMESTAMP | NO | |
| updated_at | TIMESTAMP | NO | |

---

### Table: training_sessions

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | UUID | NO | PK |
| title | VARCHAR | NO | |
| slug | VARCHAR | NO | UNIQUE |
| description | TEXT | YES | |
| mode | VARCHAR | YES | online, in-person, hybrid |
| venue | VARCHAR | YES | |
| instructor | VARCHAR | YES | |
| start_date | DATE | YES | |
| end_date | DATE | YES | |
| start_time | TIME | YES | |
| end_time | TIME | YES | |
| capacity | INT | YES | Max participants |
| requirements | TEXT | YES | Prerequisites |
| contact_email | VARCHAR | YES | |
| status | VARCHAR | NO | DRAFT, PUBLISHED |
| created_by | UUID | YES | FK → users |
| published_at | TIMESTAMP | YES | |
| created_at | TIMESTAMP | NO | |
| updated_at | TIMESTAMP | NO | |

---

### Table: training_registrations

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | UUID | NO | PK |
| session_id | UUID | NO | FK → training_sessions |
| user_id | UUID | NO | FK → users |
| status | VARCHAR | NO | registered, cancelled, attended |
| registered_at | TIMESTAMP | NO | |

**Unique Constraint:** (session_id, user_id)

---

### Table: demonstration_sites

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | UUID | NO | PK |
| name | VARCHAR | NO | |
| slug | VARCHAR | NO | UNIQUE |
| description | TEXT | YES | |
| location | VARCHAR | YES | Physical address |
| district | VARCHAR | YES | |
| site_type | VARCHAR | YES | University Campus, Health Facility, etc. |
| technology | VARCHAR | YES | Biodigester, Constructed Wetlands, etc. |
| operational_status | VARCHAR | YES | active, inactive, under_construction |
| operational_since | DATE | YES | |
| contact_person | VARCHAR | YES | |
| contact_email | VARCHAR | YES | |
| partner_institution | VARCHAR | YES | |
| latitude | DOUBLE | YES | |
| longitude | DOUBLE | YES | |
| notes | TEXT | YES | |
| created_at | TIMESTAMP | NO | |
| updated_at | TIMESTAMP | NO | |

**Indexes:** slug, operational_status, site_type

---

### Table: digitization_records

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | UUID | NO | PK |
| title | VARCHAR | NO | |
| description | TEXT | YES | |
| source_owner | VARCHAR | YES | Original document holder |
| physical_location | VARCHAR | YES | Archive shelf/box ref |
| number_of_pages | INT | YES | |
| digitization_status | VARCHAR | NO | PENDING, IN_PROGRESS, COMPLETED, FAILED |
| scanned_file_path | VARCHAR | YES | |
| ocr_text | TEXT | YES | Extracted text |
| scanned_by | UUID | YES | FK → users |
| reviewed_by | UUID | YES | FK → users |
| quality_status | VARCHAR | YES | good, fair, poor |
| copyright_status | VARCHAR | YES | |
| content_item_id | UUID | YES | FK → content_items (after linking) |
| created_at | TIMESTAMP | NO | |
| updated_at | TIMESTAMP | NO | |

---

### Table: categories

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | VARCHAR | UNIQUE |
| slug | VARCHAR | UNIQUE |
| description | TEXT | |
| parent_id | UUID | FK → categories (self-referential) |
| created_at | TIMESTAMP | |

---

### Table: approval_workflows

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| content_item_id | UUID | FK → content_items |
| submitted_by | UUID | FK → users |
| reviewed_by | UUID | FK → users (nullable) |
| status | VARCHAR | Mirrors ContentStatus |
| reviewer_comments | TEXT | |
| submitted_at | TIMESTAMP | |
| reviewed_at | TIMESTAMP | |
| published_by | UUID | FK → users (nullable) |
| published_at | TIMESTAMP | |

---

### Table: audit_logs

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → users (nullable) |
| action | VARCHAR | content.create, user.roles.update, etc. |
| entity_type | VARCHAR | content_items, users, etc. |
| entity_id | VARCHAR | UUID of affected entity |
| old_value | TEXT | JSON before state |
| new_value | TEXT | JSON after state |
| ip_address | VARCHAR | |
| user_agent | VARCHAR | |
| created_at | TIMESTAMP | |

---

### Table: system_settings

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| setting_key | VARCHAR | UNIQUE |
| setting_value | TEXT | JSON-encoded value |
| description | VARCHAR | |

**Default Settings:**

| Key | Default Value | Description |
|-----|--------------|-------------|
| system_name | "UNZA Sanitation Hub & Laboratory Repository" | Display name |
| system_abbreviation | "SANITATION-HUB" | Short identifier |
| max_upload_mb | 500 | Max file upload size |
| default_access_level | "draft" | Default for new content |
| contact_email | "sanitation@unza.zm" | Public contact |
| allow_public_registration | true | Open registration |
| require_approval_before_publish | true | Approval required |
| download_requires_login | true | Auth required for download |

---

## 5. Authentication & Security

### Authentication Methods

The system supports four authentication providers:

#### 5.1 Local Email Authentication

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/verify-email?token={token}
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/change-password
```

**Registration Flow:**
1. User submits form with email, password, full_name
2. CAPTCHA token validated against reCAPTCHA/hCaptcha API
3. Email uniqueness checked
4. Password hashed with BCrypt (strength 12)
5. User created with `status=pending`, `email_verified=false`
6. Email verification token (UUID) generated and stored
7. Verification email sent with link: `{APP_BASE_URL}/verify-email?token={token}`
8. On email link click: token validated, user activated

**Login Flow:**
1. Rate limit check: max 10 requests per 60s per IP (Redis counter)
2. Account lockout check: `login_attempts >= 5` locks for 15 minutes
3. Password verified with BCrypt
4. Failed attempt: `login_attempts++`
5. Success: `login_attempts = 0`, `last_login_at = now()`
6. JWT generated and returned

#### 5.2 LDAP (UNZA Institutional)

```
POST /api/auth/ldap-login
Body: { unza_id, password }
```

- Connects to `ldap://ldap.unza.zm:389`
- Searches `ou=People,dc=unza,dc=zm` for `uid={unza_id}`
- Authenticates with provided credentials
- Creates/updates user account (authType=LDAP, role=STAFF)

#### 5.3 OAP (Student Portal)

```
POST /api/auth/student-login
Body: { username, password, instance }
```

- Connects to UNZA Online Academic Portal
- Creates account on first login (authType=OAP, role=STUDENT)

#### 5.4 HR (Staff Portal)

```
POST /api/auth/staff-login
Body: { username, password }
```

- Connects to UNZA HR system
- Creates account on first login (authType=HR, role=STAFF)

---

### JWT Token Structure

```json
{
  "jti": "unique-token-id-for-revocation",
  "sub": "user-uuid",
  "email": "user@example.com",
  "roles": ["SUPER_ADMIN", "STAFF"],
  "iat": 1720000000,
  "exp": 1720043200
}
```

- **Algorithm:** HS256
- **Expiration:** 12 hours (configurable via `app.jwt.expiration`)
- **Secret:** Minimum 32-character random string (`app.jwt.secret`)
- **Revocation:** JTI stored in Redis with TTL on logout

### JWT Validation Flow

```
Request → JwtAuthenticationFilter
  → Extract "Bearer {token}" from Authorization header
  → Verify signature and expiration
  → Check JTI not in Redis revocation set
  → findByIdWithRoles(userId) from DB
  → Create UserPrincipal with GrantedAuthority list
  → Set in SecurityContextHolder
  → Continue to controller
```

### CORS Configuration

- Allowed Origins: Configurable via `app.cors.allowed-origin-patterns` (default: `*`)
- Allowed Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Allowed Headers: All (`*`)
- Credentials: Allowed
- Exposed Headers: Content-Disposition, Authorization

### Security Headers

Spring Boot default security headers are applied. CSRF is disabled (stateless JWT API).

---

## 6. API Reference

### Base URL

```
http://localhost:8080/api
```

All responses use **snake_case** field names (Jackson `SNAKE_CASE` strategy).

### Authentication Header

```
Authorization: Bearer <jwt_token>
```

---

### 6.1 Authentication Endpoints (`/api/auth`)

All public — no authentication required.

#### POST /api/auth/register

```json
// Request
{
  "full_name": "John Banda",
  "email": "jbanda@example.com",
  "password": "SecurePass123!",
  "phone": "+260971234567",
  "affiliation": "University of Zambia",
  "unza_id": "2019034521",
  "institution": null,
  "job_title": null
}

// Response 200
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "uuid",
    "email": "jbanda@example.com",
    "full_name": "John Banda",
    "roles": ["STUDENT"],
    "admin": false,
    "can_manage_content": false
  }
}
```

#### POST /api/auth/login

```json
// Request
{ "email": "admin@sanitation-hub.local", "password": "Admin@123456" }

// Response 200
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@sanitation-hub.local",
    "full_name": "System Administrator",
    "roles": ["SUPER_ADMIN", "PROJECT_ADMIN", "STAFF"],
    "admin": true,
    "can_manage_content": true,
    "last_login_at": "2026-07-01T10:00:00Z"
  }
}
```

#### GET /api/auth/me *(requires auth)*

```json
// Response 200
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "Jane Mwale",
  "phone": null,
  "unza_id": "2020012345",
  "auth_type": "LDAP",
  "roles": ["STAFF"],
  "admin": false,
  "can_manage_content": false,
  "last_login_at": "2026-07-01T08:30:00Z"
}
```

#### POST /api/auth/forgot-password

```json
// Request
{ "email": "user@example.com" }

// Response 200 (always — no email enumeration)
{ "message": "If this email is registered, a reset link has been sent." }
```

#### POST /api/auth/reset-password

```json
// Request
{ "token": "uuid-reset-token", "password": "NewSecurePass456!" }
// Response 204 No Content
```

#### POST /api/auth/logout *(requires auth)*
Response: 204 No Content — invalidates JWT in Redis

---

### 6.2 Public Endpoints (`/api/public`)

No authentication required.

#### GET /api/public/home

```json
// Response 200
{
  "resources": [/* latest 6 published resources */],
  "events": [/* upcoming 3 events */],
  "stats": {
    "total_resources": 142,
    "demonstration_sites": 12,
    "active_sites": 9,
    "published_events": 5,
    "training_materials": 28,
    "research_outputs": 47
  }
}
```

#### GET /api/public/resources

Query Parameters:
- `q` — full-text search query
- `type` — content type slug (report, policy, training_material, etc.)
- `category` — category slug
- `department` — department ID

```json
// Response 200
[
  {
    "id": "uuid",
    "title": "National Sanitation Policy 2022",
    "slug": "national-sanitation-policy-2022",
    "summary": "...",
    "content_type": "policy",
    "access_level": "public",
    "published_at": "2022-03-01T00:00:00Z",
    "thumbnail_url": "/api/files/thumbnail/uuid",
    "category": { "id": "uuid", "name": "Sanitation Policy", "slug": "sanitation-policy" }
  }
]
```

#### GET /api/public/resources/{slug}

```json
// Response 200
{
  "id": "uuid",
  "title": "National Sanitation Policy 2022",
  "slug": "national-sanitation-policy-2022",
  "summary": "...",
  "body": "<p>Full HTML content...</p>",
  "content_type": "policy",
  "access_level": "public",
  "language": "en",
  "keywords": "sanitation, policy, zambia",
  "authors": "Ministry of Water Development & Sanitation",
  "publisher": "Government of Zambia",
  "publication_date": "2022-03-01",
  "external_identifier": "ISBN 978-0-0000-0000-0",
  "published_at": "2022-03-01T00:00:00Z",
  "thumbnail_url": "/api/files/thumbnail/uuid",
  "files": [
    {
      "id": "uuid",
      "original_file_name": "sanitation-policy-2022.pdf",
      "mime_type": "application/pdf",
      "file_size": 2097152,
      "preview_url": "/api/files/uuid/preview",
      "download_url": "/api/files/uuid/download"
    }
  ],
  "category": { "id": "uuid", "name": "Sanitation Policy", "slug": "sanitation-policy" },
  "view_count": 342
}
```

---

### 6.3 Admin Endpoints (`/api/admin`)

**Required roles:** SUPER_ADMIN or PROJECT_ADMIN (for most); CONTENT_MANAGER, REVIEWER, or DIGITIZATION_OFFICER for content management.

#### GET /api/admin/dashboard

```json
{
  "total_resources": 45,
  "published_resources": 32,
  "draft_resources": 8,
  "pending_approval_resources": 5,
  "published_events": 3,
  "digitization_records": 12,
  "recent_content": [
    { "id": "uuid", "title": "...", "status": "published", "updated_at": "..." }
  ]
}
```

#### GET /api/admin/content?status=all

```json
[
  {
    "id": "uuid",
    "title": "Research Paper Title",
    "slug": "research-paper-title",
    "summary": "...",
    "body": "...",
    "content_type": "journal_article",
    "status": "draft",
    "access_level": "public",
    "downloadable": true,
    "copyright_status": "open_access",
    "language": "en",
    "keywords": "sanitation, research",
    "authors": "Dr. Mwansa Chanda",
    "publisher": "University of Zambia",
    "publication_date": "2024-02-10",
    "category_id": "uuid",
    "department_id": "uuid",
    "author_id": "uuid",
    "published_at": null,
    "thumbnail_url": null
  }
]
```

#### POST /api/admin/content

```json
// Request
{
  "title": "New Research Paper",
  "slug": "new-research-paper",
  "summary": "Short description",
  "body": "<p>Full content HTML</p>",
  "content_type": "journal_article",
  "access_level": "public",
  "status": "draft",
  "downloadable": true,
  "copyright_status": "open_access",
  "language": "en",
  "keywords": "keyword1, keyword2",
  "authors": "Author Name",
  "publisher": "Publisher Name",
  "publication_date": "2024-01-15",
  "category_id": "uuid",
  "department_id": "uuid"
}
```

#### POST /api/admin/content/{id}/transition

```json
// Request
{
  "action": "publish",   // submit | approve | return | publish | archive | reject
  "comments": "Approved for publication"
}
// Response 204 No Content
```

#### POST /api/admin/content/{id}/files (multipart/form-data)

```
Field: file (binary)
Response 200: ContentFileDto
```

#### POST /api/admin/content/{id}/thumbnail (multipart/form-data)

```
Field: file (image binary)
Response 200: { "url": "/api/files/thumbnail/{id}" }
```

#### GET /api/admin/users

```json
[
  {
    "id": "uuid",
    "email": "staff@unza.zm",
    "full_name": "Jane Mwale",
    "status": "active",
    "created_at": "2025-01-15T08:00:00Z",
    "last_login_at": "2026-07-01T09:00:00Z",
    "roles": ["STAFF"]
  }
]
```

#### PUT /api/admin/users/{id}/roles

```json
// Request
{ "roles": ["CONTENT_MANAGER", "STAFF"] }
// Response 204 No Content
```

#### PUT /api/admin/users/{id}/status

```json
// Request
{ "status": "suspended" }   // active | suspended | pending
// Response 204 No Content
```

#### GET /api/admin/taxonomy/{type}

`type` options: `categories`, `departments`, `schools`, `tags`, `content_types`

#### GET /api/admin/reports

```json
{
  "total_resources": 45,
  "published_resources": 32,
  "pending_approval_resources": 5,
  "draft_resources": 8,
  "archived_resources": 0,
  "events": 3,
  "digitization_records": 12,
  "registered_users": 156,
  "files_stored": 89,
  "total_storage": "2.3 GB",
  "total_views": 4821,
  "total_downloads": 1203,
  "content_by_type": {
    "journal_article": 12,
    "report": 9,
    "policy": 5,
    "training_material": 8
  },
  "recent_content": [...]
}
```

---

### 6.4 File Endpoints (`/api/files`)

#### GET /api/files/{fileId}/preview

Serves file inline (for browser preview). Access check applied based on content item access level.

#### GET /api/files/{fileId}/download

Serves file as attachment. Records DownloadRecord. Requires authentication if `download_requires_login=true`.

#### GET /api/files/thumbnail/{contentId}

Serves thumbnail image for a content item.

---

### 6.5 Account Endpoints (`/api/account`)

*Requires authentication*

#### GET /api/account/profile

Returns the authenticated user's full profile.

#### PUT /api/account/profile

```json
{
  "full_name": "Updated Name",
  "phone": "+260971234567",
  "institution": "UNZA",
  "job_title": "Lecturer"
}
```

#### GET /api/account/bookmarks
#### POST /api/account/bookmarks/{contentId}
#### DELETE /api/account/bookmarks/{contentId}

#### GET /api/account/notifications
#### PUT /api/account/notifications/read

```json
{ "all": true }
// or
{ "all": false, "ids": ["uuid1", "uuid2"] }
```

---

### Error Responses

All errors follow this format:

```json
{
  "message": "Human-readable error description",
  "status": 400
}
```

| Code | Meaning |
|------|---------|
| 400 | Validation error, bad request |
| 401 | Missing or invalid JWT token |
| 403 | Authenticated but insufficient role |
| 404 | Resource not found |
| 409 | Conflict (duplicate slug, email already exists) |
| 429 | Rate limited or account locked |
| 500 | Internal server error |

---

## 7. File Storage System

### Directory Structure

```
storage/                          ← STORAGE_ROOT (configurable)
├── content-files/
│   └── {contentItemId}/
│       ├── a1b2c3d4-e5f6.pdf     ← UUID-named files
│       └── b2c3d4e5-f6a7.docx
└── thumbnails/
    └── {contentItemId}/
        └── thumb.jpg

backups/                          ← BACKUP_DIR (configurable)
├── db-backup-20260701-120000.sql
├── files-backup-20260701-120000.zip
└── full-backup-20260701-120000.zip
```

### File Naming

Uploaded files are renamed to UUID format: `{uuid}.{extension}` to prevent conflicts and path traversal. The original filename is preserved in the database only.

### File Access Control

Files are **not served directly** by a web server. All access goes through `/api/files/{id}/preview` or `/api/files/{id}/download`. The backend:
1. Looks up `ContentFile` entity by ID
2. Checks the associated `ContentItem.accessLevel` against the authenticated user
3. Serves or denies the file

### Supported Content Types

Any file type can be uploaded. Common types in use:
- PDF (application/pdf)
- Word (application/vnd.openxmlformats-officedocument.wordprocessingml.document)
- Excel (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
- PowerPoint (application/vnd.openxmlformats-officedocument.presentationml.presentation)
- Images (image/jpeg, image/png, image/webp)
- Video (video/mp4)
- ZIP (application/zip)

---

## 8. Content Workflow

### Lifecycle States

```
DRAFT ──────────────────────────────────────────────►
  │                                                  │
  │ submit                                           │ reject (admin)
  ▼                                                  │
SUBMITTED ──────────────────────────────────────────►
  │ approve            │ return                      │
  ▼                    ▼                             │
APPROVED          RETURNED ──► (author revises)      │
  │                              └──► SUBMITTED      │
  │ publish (admin)                                  │
  ▼                                                  ▼
PUBLISHED ──────────────────────────────────────► REJECTED
  │
  │ archive (admin)
  ▼
ARCHIVED
```

### Transition Actions

| Action | From Status | To Status | Who Can Perform |
|--------|------------|-----------|----------------|
| submit | DRAFT, RETURNED | SUBMITTED | Author (STAFF, CONTENT_MANAGER) |
| approve | SUBMITTED | APPROVED | REVIEWER, CONTENT_MANAGER, ADMIN |
| return | SUBMITTED | RETURNED | REVIEWER, CONTENT_MANAGER, ADMIN |
| publish | APPROVED | PUBLISHED | SUPER_ADMIN, PROJECT_ADMIN, CONTENT_MANAGER |
| archive | PUBLISHED | ARCHIVED | SUPER_ADMIN, PROJECT_ADMIN, CONTENT_MANAGER |
| reject | SUBMITTED, APPROVED | REJECTED | SUPER_ADMIN, PROJECT_ADMIN |

Every transition creates an `ApprovalWorkflow` record and sends a `Notification` to the content author.

---

## 9. Role & Permission Model

### Roles (AppRole Enum)

| Role | Description |
|------|-------------|
| SUPER_ADMIN | Full system access — all features, settings, user management, backups |
| PROJECT_ADMIN | Project-level administration — user management, approvals, settings |
| CONTENT_MANAGER | Create, edit, manage, and publish all content |
| DIGITIZATION_OFFICER | Manage digitization records, upload scans, link to content |
| REVIEWER | Review and approve/return submitted content |
| STAFF | UNZA staff — create and submit content, access university resources |
| STUDENT | UNZA student — access public/student resources, register for training |

### Permission Matrix

| Feature | Super Admin | Project Admin | Content Manager | Reviewer | Digitization | Staff | Student | Public |
|---------|:-----------:|:-------------:|:---------------:|:--------:|:------------:|:-----:|:-------:|:------:|
| View PUBLIC resources | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View UNIVERSITY resources | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| View STAFF resources | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| View STUDENT resources | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Download files | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗* |
| Create/submit content | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ |
| Edit any content | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Review & approve | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Publish content | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Manage digitization | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Manage events/sites | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Manage training | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Manage users | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| System settings | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| View audit logs | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Create backups | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

*Download may require login depending on system setting `download_requires_login`

---

## 10. Configuration Reference

### Environment Variables

All backend settings can be overridden via environment variables. Defaults shown in parentheses.

#### Database
| Variable | Default | Description |
|----------|---------|-------------|
| DB_URL | jdbc:postgresql://localhost:5432/sanitation_hub | JDBC connection URL |
| DB_USERNAME | postgres | Database username |
| DB_PASSWORD | 11111111 | Database password |

#### Redis
| Variable | Default | Description |
|----------|---------|-------------|
| REDIS_HOST | localhost | Redis server host |
| REDIS_PORT | 6379 | Redis server port |
| REDIS_PASSWORD | (empty) | Redis password |

#### Security
| Variable | Default | Description |
|----------|---------|-------------|
| JWT_SECRET | (weak default) | **Must change in production** — 32+ chars |
| RATE_LIMIT_LOGIN | 10 | Max login attempts per window |
| RATE_LIMIT_REGISTER | 5 | Max registration attempts per window |
| RATE_LIMIT_WINDOW | 60 | Window in seconds |
| LOCKOUT_MAX_ATTEMPTS | 5 | Failed logins before lockout |
| LOCKOUT_DURATION_MINUTES | 15 | Account lockout duration |

#### File Storage
| Variable | Default | Description |
|----------|---------|-------------|
| STORAGE_ROOT | storage | Root directory for uploaded files |
| BACKUP_DIR | backups | Directory for database/file backups |

#### Email
| Variable | Default | Description |
|----------|---------|-------------|
| MAIL_HOST | smtp.gmail.com | SMTP server |
| MAIL_PORT | 587 | SMTP port |
| MAIL_USERNAME | (empty) | SMTP credentials |
| MAIL_PASSWORD | (empty) | SMTP credentials |
| MAIL_FROM | noreply@sanitation-hub.unza.ac.zm | From address |
| MAIL_ENABLED | false | Enable email sending |
| APP_BASE_URL | http://localhost:3000 | Frontend URL (for email links) |

#### CAPTCHA
| Variable | Default | Description |
|----------|---------|-------------|
| CAPTCHA_ENABLED | true | Enable CAPTCHA on registration |
| CAPTCHA_PROVIDER | recaptcha | recaptcha or hcaptcha |
| CAPTCHA_SITE_KEY | (test key) | Frontend site key |
| CAPTCHA_SECRET_KEY | (test key) | Backend verification key |

#### LDAP
| Variable | Default | Description |
|----------|---------|-------------|
| LDAP_ENABLED | false | Enable LDAP login tab |
| LDAP_URL | ldap://ldap.unza.zm:389 | LDAP server URL |
| LDAP_BASE_DN | dc=unza,dc=zm | Base distinguished name |
| LDAP_USER_DN_PATTERN | uid={0},ou=People | User DN pattern |
| LDAP_MANAGER_DN | (empty) | Service account DN |
| LDAP_MANAGER_PASSWORD | (empty) | Service account password |

#### Bootstrap (Initial Admin)
| Variable | Default | Description |
|----------|---------|-------------|
| ADMIN_EMAIL | admin@sanitation-hub.local | Initial admin email |
| ADMIN_PASSWORD | Admin@123456 | **Must change immediately** |
| ADMIN_NAME | System Administrator | Admin display name |

---

## 11. Deployment Guide

### Prerequisites

- Java 21 (JDK)
- PostgreSQL 14+
- Redis 7+
- Maven 3.9+ (for building)
- Node.js 20+ and npm (for frontend build)
- 4 GB RAM minimum (8 GB recommended)
- 50 GB storage (varies by content volume)

### Backend Deployment

#### Step 1: Create PostgreSQL Database

```sql
CREATE USER sanitation_hub WITH PASSWORD 'your_secure_password';
CREATE DATABASE sanitation_hub OWNER sanitation_hub;
GRANT ALL PRIVILEGES ON DATABASE sanitation_hub TO sanitation_hub;
```

#### Step 2: Configure Environment

Create a `.env` file or set environment variables:

```bash
export DB_URL=jdbc:postgresql://localhost:5432/sanitation_hub
export DB_USERNAME=sanitation_hub
export DB_PASSWORD=your_secure_password
export REDIS_HOST=localhost
export REDIS_PORT=6379
export JWT_SECRET=your-minimum-32-character-secret-key-here
export STORAGE_ROOT=/opt/sanitation-hub/storage
export BACKUP_DIR=/opt/sanitation-hub/backups
export ADMIN_EMAIL=admin@your-institution.zm
export ADMIN_PASSWORD=YourSecureAdminPassword
export ADMIN_NAME=System Administrator
export MAIL_ENABLED=true
export MAIL_HOST=smtp.your-provider.zm
export MAIL_PORT=587
export MAIL_USERNAME=noreply@your-institution.zm
export MAIL_PASSWORD=your_mail_password
export MAIL_FROM=noreply@your-institution.zm
export APP_BASE_URL=https://your-domain.zm
export LDAP_ENABLED=true
export LDAP_URL=ldap://ldap.unza.zm:389
```

#### Step 3: Build and Run Backend

```bash
cd "F:\Uni Zambia Hub\backend"
mvn clean package -DskipTests
java -jar target/ubirr-backend-0.0.1-SNAPSHOT.jar
```

For production with environment file:

```bash
java -jar target/ubirr-backend-0.0.1-SNAPSHOT.jar \
  --spring.config.additional-location=file:/etc/sanitation-hub/application.yml
```

Hibernate will auto-create/update the schema on first startup (`ddl-auto: update`).

#### Step 4: Create Storage Directories

```bash
mkdir -p /opt/sanitation-hub/storage/content-files
mkdir -p /opt/sanitation-hub/storage/thumbnails
mkdir -p /opt/sanitation-hub/backups
chown -R app-user:app-group /opt/sanitation-hub/
```

### Frontend Deployment

#### Step 1: Build Frontend

```bash
cd "F:\Uni Zambia Hub"
npm install
npm run build
```

#### Step 2: Configure Backend URL

Create `.env` in the frontend root:

```env
VITE_API_BASE_URL=https://api.your-domain.zm
```

#### Step 3: Serve

The built files in `/dist` can be served by Nginx, Apache, or any static file server.

**Nginx Example:**

```nginx
server {
    listen 443 ssl;
    server_name your-domain.zm;

    root /var/www/sanitation-hub/dist;
    index index.html;

    # React SPA — all routes to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API calls to Spring Boot
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 500m;
    }
}
```

### Production Checklist

- [ ] Change `JWT_SECRET` to a strong random string (minimum 32 characters)
- [ ] Change default admin password immediately after first login
- [ ] Set `MAIL_ENABLED=true` and configure SMTP
- [ ] Set `LDAP_ENABLED=true` if UNZA LDAP is available
- [ ] Set `CAPTCHA_ENABLED=true` with real reCAPTCHA keys
- [ ] Configure SSL/TLS certificates
- [ ] Set `APP_BASE_URL` to the production domain
- [ ] Configure regular database backups (use the built-in backup feature + OS-level backup)
- [ ] Set `ddl-auto: validate` in production (after initial deployment)
- [ ] Configure Redis with password
- [ ] Set firewall rules: expose only ports 80/443, not 8080 directly

---

## 12. Development Setup

### Backend Development

```bash
# Clone project and enter backend directory
cd "F:\Uni Zambia Hub\backend"

# Start PostgreSQL (Docker)
docker run -d --name postgres \
  -e POSTGRES_DB=sanitation_hub \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=11111111 \
  -p 5432:5432 postgres:14

# Start Redis (Docker)
docker run -d --name redis -p 6379:6379 redis:7

# Run backend (hot-reload with Spring DevTools)
mvn spring-boot:run
```

Backend starts on **http://localhost:8080**

Default admin credentials (bootstrapped on first start):
- Email: `admin@sanitation-hub.local`
- Password: `Admin@123456`

### Frontend Development

```bash
cd "F:\Uni Zambia Hub"
npm install
npm run dev
```

Frontend starts on **http://localhost:3000**

### Running Tests

```bash
# Backend tests
cd "F:\Uni Zambia Hub\backend"
mvn test

# Frontend type checking
cd "F:\Uni Zambia Hub"
npm run typecheck
```

---

*End of Technical Documentation*
