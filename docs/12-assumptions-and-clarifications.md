# 12 — Assumptions & Items Requiring Clarification

## Assumptions made for the design

A1. The Department of Agricultural Engineering owns the project; the Centre for ICT (CICT) co-operates on infrastructure.  
A2. CICT will host the MVP; long-term hosting decision can be deferred to month 6.  
A3. Initial user base is the University community (~30 000 potential users) with read-mostly traffic.  
A4. Public visitors do not need accounts; they can only read content explicitly marked `public` and `published`.  
A5. University staff and students authenticate with University email addresses (manual today; SSO later).  
A6. The core content team consists of approximately 5–10 named staff with `content_manager`, `reviewer`, or `digitization_officer` roles.  
A7. Large media files are stored in object storage, not in PostgreSQL.  
A8. Daily off-site backups are acceptable (RPO ≤ 24 h).  
A9. Branding will follow UNZA's official green/gold palette; the system uses the placeholder UBIRR identity until final assets are supplied.  
A10. Email delivery (password reset, notifications) uses the Auth provider's default transport for the MVP; a University-branded SMTP can be configured later.

## Items requiring formal clarification

| # | Question | Owner | Needed by |
|---|----------|-------|-----------|
| C1 | Confirmed project sponsor and budget envelope | Department | Week 1 |
| C2 | Approval for consultancy engagement (if external developer required) | University policy | Week 1 |
| C3 | Final technology stack ratification (this proposal recommends TanStack + managed Postgres) | CICT | Week 1 |
| C4 | Expected number of concurrent users and storage volumes for years 1–3 | Department | Week 2 |
| C5 | LDAP / SSO integration requirement and timing | CICT | Week 2 |
| C6 | Whether public users will be allowed to register accounts (default: no) | Department | Week 2 |
| C7 | Default download permission for public PDFs and videos | Department | Week 2 |
| C8 | Copyright ownership and licensing model for academic materials | Department + Library | Week 3 |
| C9 | Approval authority for public publication (single role or committee?) | Department | Week 3 |
| C10 | Availability and ownership of digitisation hardware (scanner, OCR licences) | Department + CICT | Week 4 |
| C11 | Final University branding assets (logo, colours, typography) | Marketing & Public Relations | Week 2 |
| C12 | Domain / subdomain to use (`biosafety.unza.zm`?) | CICT | Week 6 |
| C13 | Backup destination (on-prem? cloud region?) | CICT | Week 6 |
| C14 | Long-term maintenance ownership and sustainability funding | Department + CICT | Week 8 |
| C15 | Data retention policy for archived content | Department | Week 8 |
