# 16 — MVP Scope

The Minimum Viable Product is the slice that ships in the 8-week plan. It satisfies every acceptance criterion in the brief while deferring optional capabilities to a future phase.

## ✅ Included in MVP

| Module | Capability |
|---|---|
| Auth | Email/password, sign up, sign in, password reset, leaked-password check, session timeout |
| RBAC | 7 roles, separate `user_roles` table, security-definer helper functions, RLS on every table |
| Content | Create/edit/delete; 13 content types; access levels (public, university, staff, student, core_team, draft); copyright/licence fields |
| Files | Upload to private object storage; MIME/size validation; signed-URL preview & download; file metadata in DB |
| Approval workflow | draft → submitted → returned/rejected/approved → published → archived; history table; reviewer comments |
| Public portal | Home, Library (search & filter), Resource detail (PDF/video/audio/image preview), Events, About, Contact |
| Search | PostgreSQL `tsvector` full-text + filters |
| Events | CRUD + publish workflow; public events page |
| Digitization | Records, status workflow, OCR-text capture, optional link to a public content item |
| Admin dashboard | Counts, recent activity, role-aware navigation |
| Users & roles | Assignment UI |
| Audit logs | DB-level table; viewer; written on every workflow transition and privileged action |
| System settings | Key/value config editor |
| Backup | Managed daily PITR (cloud) |
| Branding | UNZA-style green/gold palette; placeholder identity until official assets supplied |

## ⏸ Deferred (post-MVP roadmap)

| Capability | Reason for deferral |
|---|---|
| LDAP / Active Directory / Single Sign-On | Requires CICT integration work; interface stub left in place |
| Multi-factor authentication for admins | Auth provider supports it; enable when policy approved |
| Automated OCR pipeline | MVP captures OCR text manually; future: hook a Tesseract worker on file upload |
| Virus scanning on upload | Requires extra runtime; planned for Phase 2 |
| Email notifications | In-app notifications shipped; SMTP wiring left as configuration task |
| Scheduled off-site backups beyond cloud defaults | On-prem deployments only |
| Rich analytics charts (top viewed, top downloaded over time) | Tables and counters in place; UI in Phase 2 |
| Public user self-registration policy | Currently any visitor can register and lands as `student`; tighten in Phase 2 once policy is set |
| Granular per-department dashboards | Single global dashboard for MVP |
| Versioned file history with diff/preview | `file_versions` table reserved; UI in Phase 2 |
| Workflow notifications by email | Hook point exists; transport not configured in MVP |

## Acceptance criteria → MVP mapping

| # | Criterion | Covered by |
|---|-----------|-----------|
| 1 | Secure login | Auth module |
| 2 | Admin creates / manages users | Users & roles page |
| 3 | Roles & permissions work | RLS + role checks |
| 4 | Content managers create resources | Content editor |
| 5 | Video, audio, PDF, image, text supported | Content types + file uploads |
| 6 | Submit for review | Workflow |
| 7 | Approve / reject / return | Approvals page |
| 8 | Publish approved content | Admin publish action |
| 9 | Public sees public content only | RLS `p_ci_public_read` |
| 10 | Restricted content protected | RLS per access level |
| 11 | Search & filter | Library + tsvector |
| 12 | Events create & publish | Events admin |
| 13 | Digitization records managed | Digitization admin |
| 14 | Reports & analytics | Dashboard counts |
| 15 | Audit logs | Audit table + viewer |
| 16 | Files stored securely | Private bucket + signed URLs |
| 17 | Backups configured | Managed daily PITR |
| 18 | Deployed on secure server | Lovable Cloud (HTTPS, HSTS) |
| 19 | User documentation | `docs/14-user-manual.md` |
| 20 | Administrator documentation | `docs/15-admin-manual.md` |
