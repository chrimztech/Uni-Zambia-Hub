# 05 - API Design

UBIRR now exposes a single application API from Spring Boot.

## API groups

| Prefix | Purpose |
|---|---|
| `/api/auth` | login, register, password reset, current user |
| `/api/public` | public resources, events, categories, gallery, RSS, sitemap |
| `/api/account` | profile, bookmarks, notifications, recent views, reading lists |
| `/api/admin` | dashboard, content, approvals, events, digitization, users, taxonomy, settings, reports, audit |
| `/api/files` | preview and download file streams |

## Authentication endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/change-password`
- `POST /api/auth/logout`

## Public endpoints

- `GET /api/public/home`
- `GET /api/public/resources`
- `GET /api/public/resources/{slug}`
- `POST /api/public/resources/{id}/views`
- `GET /api/public/events`
- `GET /api/public/events/{slug}`
- `GET /api/public/categories`
- `GET /api/public/gallery`
- `GET /api/public/rss`
- `GET /api/public/sitemap`

## Account endpoints

- `GET /api/account/profile`
- `PUT /api/account/profile`
- `GET /api/account/bookmarks`
- `GET /api/account/bookmarks/{contentId}/status`
- `POST /api/account/bookmarks/{contentId}`
- `DELETE /api/account/bookmarks/{contentId}`
- `GET /api/account/recent-views`
- `GET /api/account/notifications`
- `PUT /api/account/notifications/read`
- `GET /api/account/reading-lists`
- `POST /api/account/reading-lists`
- `PUT /api/account/reading-lists/{id}`
- `DELETE /api/account/reading-lists/{id}`
- `POST /api/account/reading-lists/{id}/items`
- `DELETE /api/account/reading-lists/items/{itemId}`

## Admin endpoints

- `GET /api/admin/dashboard`
- `GET /api/admin/content`
- `POST /api/admin/content`
- `PUT /api/admin/content/{id}`
- `POST /api/admin/content/{id}/transition`
- `GET /api/admin/content/{id}/files`
- `POST /api/admin/content/{id}/files`
- `DELETE /api/admin/content/files/{fileId}`
- `GET /api/admin/approvals`
- `POST /api/admin/approvals/{id}/action`
- `GET /api/admin/events`
- `POST /api/admin/events`
- `PUT /api/admin/events/{id}`
- `POST /api/admin/events/{id}/publish`
- `GET /api/admin/digitization`
- `POST /api/admin/digitization`
- `PUT /api/admin/digitization/{id}`
- `GET /api/admin/users`
- `PUT /api/admin/users/{id}/roles`
- `GET /api/admin/taxonomy/{type}`
- `POST /api/admin/taxonomy/{type}`
- `DELETE /api/admin/taxonomy/{type}/{id}`
- `GET /api/admin/settings`
- `PUT /api/admin/settings/{key}`
- `GET /api/admin/reports`
- `GET /api/admin/audit`

## File endpoints

- `GET /api/files/{fileId}/preview`
- `GET /api/files/{fileId}/download`

Files are streamed by the backend and access rules are enforced before the content is returned.
