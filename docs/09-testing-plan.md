# 09 — Testing Plan

## Test pyramid

```
        ▲   E2E / UAT (Playwright, manual)
       ███
      ██████  Integration (API + DB, RLS contract)
     ████████ Unit (pure functions, hooks)
```

## Unit tests
Scope: pure helpers (`slugify`, `formatBytes`), Zod schemas, role-helper functions.
Tooling: Vitest + React Testing Library.

## Integration tests
Scope:
- Each RLS policy: a non-privileged user cannot read/write rows they should not see.
- Workflow transitions: state machine yields exactly the documented next states.
- Search: known-keyword query returns expected rows with weighted ranking.
Tooling: Vitest with a dedicated test database seeded from a fixture migration.

## End-to-end / UAT
Scope: full user journeys exercised in a headless browser.

Mandatory scenarios:
1. Visitor lands on home → searches "biosafety" → opens a public PDF → downloads.
2. Content manager signs in → creates draft → uploads PDF → submits.
3. Reviewer approves; project admin publishes; the item appears on the public library within one cache cycle.
4. Reviewer returns an item with comments; author edits and resubmits.
5. Admin assigns a new role; affected user gains access after re-sign-in.
6. Digitization officer records a hard copy, uploads scan, adds OCR, submits, gets published.

## Security tests
- RLS: attempt to read `core_team` content as a `student` — must return zero rows.
- File access: attempt to fetch a `content-files` object via the public S3 URL without a signed token — must 403.
- Brute force: 20 failed sign-ins within a minute should trigger Auth-provider rate limiting.
- SQL injection: submit `'; DROP TABLE content_items; --` in every text field; verify no schema change and the input is stored/escaped.
- XSS: submit `<script>alert(1)</script>` in title and body; verify it renders as text.
- Audit completeness: every workflow action writes a corresponding `audit_logs` row.

## Performance tests
- Library page with 5 000 published items: cold load < 3 s, p95 < 2 s.
- Search across 50 000 items: < 500 ms p95.
- Signed URL latency: < 200 ms.

## Backup & recovery
- Restore a full backup to a sandbox monthly; record RTO.
- Diff a known table row count before/after to confirm completeness.

## Acceptance criteria
The acceptance criteria from the brief (§22) form the UAT script. Sign-off requires all 20 items demonstrably pass on a staging environment.
