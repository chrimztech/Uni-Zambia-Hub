# 13 - Deployment Guide

## Local development

### Frontend

```bash
npm install
npm run dev
```

Set:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### Backend

```bash
cd backend
mvn spring-boot:run
```

The default backend runs on `http://localhost:8080`.

## Production checklist

1. Build the frontend with `npm run build`.
2. Build the backend with `mvn clean package`.
3. Set a strong `app.jwt.secret`.
4. Point `VITE_API_BASE_URL` at the deployed backend origin.
5. Store `app.storage.root` on persistent disk.
6. Replace the default H2 database with a production database.
7. Update CORS to allow only trusted frontend origins.

## Important backend settings

| Setting | Purpose |
|---|---|
| `server.port` | API port |
| `spring.datasource.url` | Database connection |
| `app.jwt.secret` | JWT signing secret |
| `app.jwt.expiration` | Token lifetime |
| `app.storage.root` | Uploaded file location |
| `app.bootstrap.admin-email` | Initial admin account |
| `app.bootstrap.admin-password` | Initial admin password |

## Verification

1. `GET /api/public/home` returns data.
2. Frontend loads `/`, `/library`, and `/events`.
3. Login works with the bootstrap admin account.
4. Admin content creation and file upload succeed.
5. Resource previews and downloads work through `/api/files/*`.
