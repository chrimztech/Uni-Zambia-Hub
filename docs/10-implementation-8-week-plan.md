# 10 — 8-Week Implementation Plan

The two-month target is ambitious. It assumes a dedicated developer, a named project administrator from the Department, and CICT availability of at least two staff for infrastructure and security reviews.

| Week | Theme | Deliverables |
|------|-------|--------------|
| 1 | Discovery & sign-off | Confirmed scope; named stakeholders; approved hosting decision; SRS sign-off |
| 2 | Design | Wireframes; ERD; security review of RLS plan; branding assets |
| 3 | Foundations | Schema migration; RLS policies; auth flow; sign-in/sign-up; role seeding; CI |
| 4 | Content & files | Content CRUD; file upload; categories/tags; signed-URL delivery |
| 5 | Workflow & portal | Approval workflow; public library; resource detail; search |
| 6 | Events & digitisation | Events CRUD + public events page; digitisation queue; OCR text capture |
| 7 | Reports, audit, hardening | Dashboard; audit log viewer; settings; security tests; backup configuration; UAT scripts |
| 8 | Launch | UAT with content team; corrections; user/admin training; production deploy; handover docs |

## Critical-path dependencies
- Branding assets (logo, colours) → needed by end of Week 2.
- Sample content (≥ 20 items per type) → needed by Week 5 for realistic search testing.
- CICT-issued domain (e.g. `biosafety.unza.zm`) → needed by end of Week 7.
- Named project administrator account with `super_admin` role → Week 3.

## Communication
- Weekly 30-minute steering meeting (Department + CICT + developer).
- Issue tracker (single source of truth); blockers raised within one working day.

## Definition of done (per feature)
1. Schema migration committed and reviewed.
2. RLS policies tested with at least one positive and one negative case.
3. UI screen implemented with empty/loading/error states.
4. End-to-end happy path exercised in a browser.
5. Documented in the user or admin manual.
