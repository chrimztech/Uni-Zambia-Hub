# 03 - System Architecture

## Overview

UBIRR now runs as a split application:

- `src/` contains the TanStack Start frontend used for the public portal, authentication screens, and admin console.
- `backend/` contains a Spring Boot API that owns authentication, business rules, persistence, and file delivery.

## High-level flow

```text
Browser
  |
  v
TanStack Start frontend
  |
  v
Spring Boot API (/api/auth, /api/public, /api/account, /api/admin, /api/files)
  |
  +--> JPA/Hibernate entities + repositories
  +--> H2 file database by default
  +--> Local filesystem storage for uploaded content
```

## Main responsibilities

| Layer | Responsibility |
|---|---|
| Frontend | Routing, forms, query caching, public UI, admin UI |
| Spring Boot controllers | HTTP endpoints and request validation |
| Services | Authentication, content workflow, reporting, account actions |
| Repositories | Persistence via Spring Data JPA |
| Storage service | Save, load, and delete uploaded files |

## Frontend modules

```text
src/
|- components/      shared UI and page building blocks
|- hooks/           auth/session hooks
|- lib/             API client, formatting helpers
|- routes/          public, authenticated, and admin routes
```

## Backend modules

```text
backend/src/main/java/com/unza/ubirr/
|- config/          security, storage, exception handling
|- controller/      REST endpoints
|- dto/             request/response payloads
|- model/           JPA entities and enums
|- repository/      Spring Data repositories
|- security/        JWT filter and user principal support
|- service/         application business logic
```

## Runtime notes

- Frontend requests the backend through `VITE_API_BASE_URL`.
- JWT tokens are issued by Spring Boot and stored by the frontend.
- File previews and downloads are served through `/api/files/*`.
- The default development database is `jdbc:h2:file:./data/ubirr`.
