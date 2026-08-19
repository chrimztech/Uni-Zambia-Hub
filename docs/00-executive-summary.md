# 00 — Executive Summary

**System name:** UNZA Biosafety Information & Resource Repository (UBIRR)

**Sponsor:** Department of Agricultural Engineering, School of Engineering, University of Zambia, in collaboration with the Centre for Information and Communication Technologies (CICT).

**Purpose.** UBIRR provides a single, governed, web-based platform for the University of Zambia community and the general public to discover, access, and disseminate biosafety, academic, educational, and public-information resources — including videos, audio, PDFs, images, articles, digitised hard-copy materials, and University events.

**Why now.** Following a meeting on 19 June 2026 with Dr Victor Kaluba, the Department identified the need for a centralised repository to consolidate dispersed materials, support biosafety technology outreach, and reduce reliance on ad-hoc file sharing.

**Approach.** A modern, secure, role-based web application backed by a managed PostgreSQL database and S3-compatible object storage. Public users access approved content without sign-in; authenticated users access scoped content based on role. Content moves through a documented submit → review → approve → publish workflow with full audit logging.

**MVP delivery (8 weeks).** Login, RBAC, content & file management, approval workflow, public portal, search, events, digitization workflow, basic reports, audit logs, and configured backups. See [MVP Scope](./16-mvp-scope.md).

**Stack.** TanStack Start (React 19 + Vite) frontend and server functions; PostgreSQL 15+ with Row-Level Security; managed authentication; S3-compatible storage; deployed to Lovable Cloud (Cloudflare Workers edge runtime). See [Architecture](./03-architecture.md) for justification.

**Open items.** Project budget, consultancy arrangements, expected user/storage volumes, copyright ownership of academic materials, and final hosting decision — see [Assumptions & Clarifications](./12-assumptions-and-clarifications.md).
