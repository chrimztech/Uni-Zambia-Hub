# UNZA Sanitation Hub — Deployment & Operations Guide

**Version:** 1.0  
**Date:** July 2026  
**Audience:** IT Administrators, System Engineers  
**System:** UNZA Decentralized Sanitation Systems Hub

---

## Table of Contents

1. [System Requirements](#1-system-requirements)
2. [Pre-Installation Checklist](#2-pre-installation-checklist)
3. [Database Setup](#3-database-setup)
4. [Redis Setup](#4-redis-setup)
5. [Backend Deployment](#5-backend-deployment)
6. [Frontend Deployment](#6-frontend-deployment)
7. [Nginx Configuration](#7-nginx-configuration)
8. [SSL/TLS Configuration](#8-ssltls-configuration)
9. [Environment Variables Reference](#9-environment-variables-reference)
10. [Running as a System Service](#10-running-as-a-system-service)
11. [Email Configuration](#11-email-configuration)
12. [LDAP Integration](#12-ldap-integration)
13. [CAPTCHA Configuration](#13-captcha-configuration)
14. [Backup & Recovery Procedures](#14-backup--recovery-procedures)
15. [Monitoring & Health Checks](#15-monitoring--health-checks)
16. [Maintenance Tasks](#16-maintenance-tasks)
17. [Troubleshooting](#17-troubleshooting)
18. [Security Hardening](#18-security-hardening)

---

## 1. System Requirements

### Minimum Hardware

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 2 cores | 4 cores |
| RAM | 4 GB | 8 GB |
| Storage | 50 GB | 200 GB+ |
| Network | 10 Mbps | 100 Mbps |

Storage grows as content is uploaded. Plan 1 GB per ~200 uploaded documents.

### Software Dependencies

| Component | Minimum Version | Notes |
|-----------|----------------|-------|
| Java (JDK) | 21 | OpenJDK or Oracle JDK |
| PostgreSQL | 14 | 15 or 16 preferred |
| Redis | 7 | Optional but strongly recommended |
| Node.js | 20 LTS | For building the frontend |
| npm | 9+ | Bundled with Node.js |
| Maven | 3.9+ | For building the backend |
| Nginx | 1.20+ | Recommended reverse proxy |

### Operating System

- Linux (Ubuntu 22.04 LTS / Debian 12 recommended)
- Windows Server 2022 (development/small deployments)
- CentOS/RHEL 8+ (enterprise deployments)

---

## 2. Pre-Installation Checklist

Before deploying, confirm the following:

- [ ] Server accessible via SSH
- [ ] Java 21 JDK installed: `java -version`
- [ ] PostgreSQL 14+ installed and running
- [ ] Redis 7+ installed and running
- [ ] Node.js 20+ installed: `node -v`
- [ ] Maven 3.9+ installed: `mvn -v`
- [ ] Domain name configured and DNS pointing to server
- [ ] SSL certificate available (Let's Encrypt or institutional CA)
- [ ] SMTP credentials obtained from email provider
- [ ] LDAP server details obtained from UNZA IT department
- [ ] reCAPTCHA or hCaptcha site/secret keys obtained
- [ ] Firewall rules configured (ports 80, 443 open; 8080 internal only)

---

## 3. Database Setup

### 3.1 Install PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo dnf install postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 3.2 Create Database and User

```bash
sudo -u postgres psql
```

```sql
-- Create dedicated user
CREATE USER sanitation_hub WITH PASSWORD 'your_strong_password_here';

-- Create database
CREATE DATABASE sanitation_hub
  OWNER sanitation_hub
  ENCODING 'UTF8'
  LC_COLLATE 'en_US.UTF-8'
  LC_CTYPE 'en_US.UTF-8';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE sanitation_hub TO sanitation_hub;

-- Exit
\q
```

### 3.3 PostgreSQL Configuration

Edit `/etc/postgresql/14/main/postgresql.conf`:

```conf
# Connection settings
max_connections = 100
shared_buffers = 256MB          # Set to 25% of available RAM
effective_cache_size = 768MB    # Set to 75% of available RAM
work_mem = 4MB
maintenance_work_mem = 64MB

# Logging (for monitoring)
log_min_duration_statement = 1000   # Log queries taking >1 second
log_connections = on
log_disconnections = on
```

Edit `/etc/postgresql/14/main/pg_hba.conf`:

```conf
# Allow local application connection
host  sanitation_hub  sanitation_hub  127.0.0.1/32  scram-sha-256
```

Restart PostgreSQL:

```bash
sudo systemctl restart postgresql
```

### 3.4 Verify Connection

```bash
psql -U sanitation_hub -h 127.0.0.1 -d sanitation_hub -c "SELECT 1;"
```

---

## 4. Redis Setup

### 4.1 Install Redis

```bash
# Ubuntu/Debian
sudo apt install redis-server

# CentOS/RHEL
sudo dnf install redis
```

### 4.2 Configure Redis

Edit `/etc/redis/redis.conf`:

```conf
# Bind to localhost only
bind 127.0.0.1

# Set a password (required in production)
requirepass your_redis_password_here

# Set memory limit
maxmemory 512mb
maxmemory-policy allkeys-lru

# Enable persistence
save 900 1
save 300 10
save 60 10000
```

```bash
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### 4.3 Verify Redis

```bash
redis-cli -a your_redis_password ping
# Expected: PONG
```

---

## 5. Backend Deployment

### 5.1 Build the Backend

```bash
cd "F:\Uni Zambia Hub\backend"

# On Linux
cd /opt/sanitation-hub/backend

mvn clean package -DskipTests
```

This creates `target/ubirr-backend-0.0.1-SNAPSHOT.jar`.

### 5.2 Create Application Directory

```bash
sudo mkdir -p /opt/sanitation-hub
sudo mkdir -p /opt/sanitation-hub/storage/content-files
sudo mkdir -p /opt/sanitation-hub/storage/thumbnails
sudo mkdir -p /opt/sanitation-hub/backups
sudo mkdir -p /opt/sanitation-hub/logs

# Create a dedicated system user
sudo useradd -r -s /bin/false sanitation-hub
sudo chown -R sanitation-hub:sanitation-hub /opt/sanitation-hub
```

### 5.3 Create Configuration File

```bash
sudo nano /opt/sanitation-hub/application.yml
```

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/sanitation_hub
    username: sanitation_hub
    password: your_db_password
  jpa:
    hibernate:
      ddl-auto: update    # Change to 'validate' after first successful startup
  data:
    redis:
      host: localhost
      port: 6379
      password: your_redis_password
  mail:
    host: smtp.gmail.com
    port: 587
    username: noreply@your-domain.zm
    password: your_smtp_password

app:
  jwt:
    secret: your-minimum-32-character-random-secret-key-change-this
    expiration: PT12H
  storage:
    root: /opt/sanitation-hub/storage
  backup:
    dir: /opt/sanitation-hub/backups
  mail:
    from: noreply@your-domain.zm
    base-url: https://your-domain.zm
    enabled: true
  bootstrap:
    admin-email: admin@your-institution.zm
    admin-password: ChangeThisImmediately!
    admin-name: System Administrator
  ldap:
    enabled: true
    url: ldap://ldap.unza.zm:389
    base-dn: dc=unza,dc=zm
  captcha:
    enabled: true
    provider: recaptcha
    site-key: your_recaptcha_site_key
    secret-key: your_recaptcha_secret_key
```

### 5.4 Run the Application

```bash
java -jar /opt/sanitation-hub/ubirr-backend-0.0.1-SNAPSHOT.jar \
  --spring.config.additional-location=file:/opt/sanitation-hub/application.yml \
  --logging.file.name=/opt/sanitation-hub/logs/application.log \
  --logging.level.root=INFO
```

The backend starts on port **8080**. On first start, Hibernate creates all database tables and the seeder populates default data.

---

## 6. Frontend Deployment

### 6.1 Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs
```

### 6.2 Build the Frontend

```bash
cd "F:\Uni Zambia Hub"   # or /opt/sanitation-hub/frontend on Linux

# Create production environment file
echo "VITE_API_BASE_URL=https://your-domain.zm" > .env.production

npm install
npm run build
```

The build output is in the `dist/` directory.

### 6.3 Deploy to Web Server

```bash
sudo mkdir -p /var/www/sanitation-hub
sudo cp -r dist/* /var/www/sanitation-hub/
sudo chown -R www-data:www-data /var/www/sanitation-hub
```

---

## 7. Nginx Configuration

### 7.1 Install Nginx

```bash
sudo apt install nginx
```

### 7.2 Site Configuration

```bash
sudo nano /etc/nginx/sites-available/sanitation-hub
```

```nginx
# HTTP → HTTPS redirect
server {
    listen 80;
    server_name your-domain.zm www.your-domain.zm;
    return 301 https://$server_name$request_uri;
}

# HTTPS main server
server {
    listen 443 ssl http2;
    server_name your-domain.zm www.your-domain.zm;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/your-domain.zm/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.zm/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";

    # Frontend (React SPA)
    root /var/www/sanitation-hub;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1024;

    # React Router — all non-API routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }

    # Static assets — long cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API — proxy to Spring Boot
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Large file upload support
        client_max_body_size 500m;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

### 7.3 Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/sanitation-hub /etc/nginx/sites-enabled/
sudo nginx -t          # Test configuration
sudo systemctl reload nginx
```

---

## 8. SSL/TLS Configuration

### Using Let's Encrypt (Recommended for production)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.zm -d www.your-domain.zm
```

Certbot auto-renews certificates. Verify auto-renewal:

```bash
sudo certbot renew --dry-run
```

### Using UNZA/Institutional Certificate

Place your certificate files at:
- `/etc/ssl/certs/sanitation-hub.crt` — certificate chain
- `/etc/ssl/private/sanitation-hub.key` — private key

Update Nginx config to use these paths.

---

## 9. Environment Variables Reference

For production, set these as environment variables or in the Spring Boot YAML configuration file.

### Required for Production

| Variable | Description |
|----------|-------------|
| `DB_URL` | Full JDBC URL: `jdbc:postgresql://host:5432/sanitation_hub` |
| `DB_USERNAME` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `JWT_SECRET` | Random 32+ character string — **never use the default** |
| `ADMIN_EMAIL` | Bootstrap admin email |
| `ADMIN_PASSWORD` | Bootstrap admin password |
| `APP_BASE_URL` | Full URL of the frontend: `https://your-domain.zm` |

### Required for Full Functionality

| Variable | Description |
|----------|-------------|
| `REDIS_HOST` | Redis server hostname |
| `REDIS_PASSWORD` | Redis password |
| `MAIL_ENABLED` | Set to `true` to enable email |
| `MAIL_HOST` | SMTP server hostname |
| `MAIL_USERNAME` | SMTP login username |
| `MAIL_PASSWORD` | SMTP login password |
| `MAIL_FROM` | Sender email address |
| `STORAGE_ROOT` | Absolute path to file storage directory |
| `BACKUP_DIR` | Absolute path to backup directory |
| `CAPTCHA_ENABLED` | `true` for production |
| `CAPTCHA_SITE_KEY` | reCAPTCHA or hCaptcha site key |
| `CAPTCHA_SECRET_KEY` | reCAPTCHA or hCaptcha secret key |

---

## 10. Running as a System Service

### systemd Service (Linux — Recommended)

```bash
sudo nano /etc/systemd/system/sanitation-hub.service
```

```ini
[Unit]
Description=UNZA Sanitation Hub Backend
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=sanitation-hub
Group=sanitation-hub
WorkingDirectory=/opt/sanitation-hub

Environment="JAVA_OPTS=-Xms512m -Xmx2048m -XX:+UseG1GC"

ExecStart=/usr/bin/java \
  ${JAVA_OPTS} \
  -jar /opt/sanitation-hub/ubirr-backend-0.0.1-SNAPSHOT.jar \
  --spring.config.additional-location=file:/opt/sanitation-hub/application.yml \
  --logging.file.name=/opt/sanitation-hub/logs/application.log

Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=sanitation-hub

# Security
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable sanitation-hub
sudo systemctl start sanitation-hub
sudo systemctl status sanitation-hub
```

### Log Monitoring

```bash
# View live logs
sudo journalctl -u sanitation-hub -f

# View last 100 lines
sudo journalctl -u sanitation-hub -n 100

# View application log file
tail -f /opt/sanitation-hub/logs/application.log
```

---

## 11. Email Configuration

### Gmail SMTP

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your-account@gmail.com
    password: your-app-specific-password   # NOT your Gmail password
    properties:
      mail.smtp.auth: true
      mail.smtp.starttls.enable: true
```

> Use a **Google App Password** (not your regular Gmail password). Generate one at: Google Account → Security → 2-Step Verification → App Passwords.

### Office 365 SMTP

```yaml
spring:
  mail:
    host: smtp.office365.com
    port: 587
    username: noreply@your-institution.zm
    password: your_email_password
    properties:
      mail.smtp.auth: true
      mail.smtp.starttls.enable: true
      mail.smtp.starttls.required: true
```

### Testing Email

After configuration, use the forgot-password feature to send a test email. Check the application logs for any SMTP errors.

---

## 12. LDAP Integration

### UNZA LDAP Configuration

```yaml
app:
  ldap:
    enabled: true
    url: ldap://ldap.unza.zm:389
    base-dn: dc=unza,dc=zm
    user-dn-pattern: uid={0},ou=People
    user-search-base: ou=People
    user-search-filter: (uid={0})
    email-attribute: mail
    name-attribute: cn
    manager-dn: cn=service-account,dc=unza,dc=zm    # If anonymous bind not allowed
    manager-password: service-account-password
```

### Testing LDAP Connectivity

```bash
# Test LDAP connection (requires ldap-utils)
sudo apt install ldap-utils

# Test anonymous search
ldapsearch -H ldap://ldap.unza.zm:389 \
  -b "ou=People,dc=unza,dc=zm" \
  "(uid=test_user_id)" mail cn

# Test with bind credentials
ldapsearch -H ldap://ldap.unza.zm:389 \
  -D "cn=service-account,dc=unza,dc=zm" \
  -w "service-account-password" \
  -b "ou=People,dc=unza,dc=zm" \
  "(uid=test_user_id)" mail cn
```

### LDAP Troubleshooting

- **Connection refused:** Check firewall rules. LDAP uses port 389 (or 636 for LDAPS)
- **Invalid credentials:** Verify the user DN pattern matches UNZA's LDAP structure
- **Users created with wrong attributes:** Check `email-attribute` and `name-attribute` settings

---

## 13. CAPTCHA Configuration

### Google reCAPTCHA v2

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Register your site with type **reCAPTCHA v2 (checkbox)**
3. Add your domain to the allowed list
4. Copy the **Site Key** and **Secret Key**

```yaml
app:
  captcha:
    enabled: true
    provider: recaptcha
    site-key: 6LdXXXXXXXXXXXXXXXXXXXXX
    secret-key: 6LdXXXXXXXXXXXXXXXXXXXXX
```

### hCaptcha Alternative

1. Register at [hCaptcha Dashboard](https://dashboard.hcaptcha.com)
2. Create a new site
3. Copy the **Site Key** and **Secret Key**

```yaml
app:
  captcha:
    enabled: true
    provider: hcaptcha
    site-key: your-hcaptcha-site-key
    secret-key: your-hcaptcha-secret-key
```

---

## 14. Backup & Recovery Procedures

### 14.1 Built-in Backup System

The application has a built-in backup feature accessible at **Admin → Backup**.

Backups are stored in `BACKUP_DIR` (default: `./backups`).

Types:
- **Database backup** — Full PostgreSQL dump (`.sql`)
- **Files backup** — All uploaded content files (`.zip`)
- **Full backup** — Both database and files combined (`.zip`)

### 14.2 Automated Database Backups (Cron)

Set up daily automated backups via cron:

```bash
# Open crontab for postgres user
sudo crontab -u postgres -e
```

```cron
# Daily database backup at 2:00 AM
0 2 * * * pg_dump -U sanitation_hub sanitation_hub > /opt/sanitation-hub/backups/auto-db-$(date +\%Y\%m\%d).sql 2>> /opt/sanitation-hub/logs/backup.log

# Delete backups older than 30 days
0 3 * * * find /opt/sanitation-hub/backups/ -name "auto-db-*.sql" -mtime +30 -delete
```

### 14.3 Files Backup (Cron)

```bash
# Add to root crontab
sudo crontab -e
```

```cron
# Weekly files backup on Sunday at 3:00 AM
0 3 * * 0 tar -czf /opt/sanitation-hub/backups/auto-files-$(date +\%Y\%m\%d).tar.gz /opt/sanitation-hub/storage/ 2>> /opt/sanitation-hub/logs/backup.log
```

### 14.4 Restoring the Database

```bash
# Stop the application
sudo systemctl stop sanitation-hub

# Drop and recreate the database
sudo -u postgres psql -c "DROP DATABASE sanitation_hub;"
sudo -u postgres psql -c "CREATE DATABASE sanitation_hub OWNER sanitation_hub;"

# Restore the dump
psql -U sanitation_hub -h 127.0.0.1 -d sanitation_hub < /path/to/backup.sql

# Restart the application
sudo systemctl start sanitation-hub
```

### 14.5 Restoring Files

```bash
# Extract backup to storage root
tar -xzf /path/to/files-backup.tar.gz -C /
# or for ZIP files
unzip /path/to/files-backup.zip -d /opt/sanitation-hub/storage/

# Fix ownership
chown -R sanitation-hub:sanitation-hub /opt/sanitation-hub/storage/
```

---

## 15. Monitoring & Health Checks

### 15.1 Health Check Endpoint

```bash
curl http://localhost:8080/api/public/home
# Should return 200 OK with JSON data
```

### 15.2 Application Logs

```bash
# Real-time log monitoring
tail -f /opt/sanitation-hub/logs/application.log

# Search for errors
grep "ERROR" /opt/sanitation-hub/logs/application.log | tail -50

# Search for warnings
grep "WARN" /opt/sanitation-hub/logs/application.log | tail -50
```

### 15.3 Database Monitoring

```bash
# Active connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity WHERE datname='sanitation_hub';"

# Database size
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('sanitation_hub'));"

# Large tables
sudo -u postgres psql -d sanitation_hub -c "
SELECT relname, pg_size_pretty(pg_total_relation_size(oid)) 
FROM pg_class WHERE relkind='r' 
ORDER BY pg_total_relation_size(oid) DESC LIMIT 10;
"
```

### 15.4 Redis Monitoring

```bash
redis-cli -a your_redis_password info stats | grep -E "keyspace_hits|keyspace_misses|connected_clients"
```

### 15.5 Disk Space Monitoring

```bash
# Check disk usage
df -h /opt/sanitation-hub/

# Storage directory size
du -sh /opt/sanitation-hub/storage/
du -sh /opt/sanitation-hub/backups/
```

---

## 16. Maintenance Tasks

### 16.1 Application Updates

```bash
# 1. Pull new code
cd /opt/sanitation-hub/source
git pull origin main

# 2. Build backend
cd backend
mvn clean package -DskipTests

# 3. Build frontend
cd ../
npm install
npm run build
sudo cp -r dist/* /var/www/sanitation-hub/

# 4. Deploy new JAR
sudo cp backend/target/ubirr-backend-*.jar /opt/sanitation-hub/

# 5. Restart service
sudo systemctl restart sanitation-hub

# 6. Monitor startup
sudo journalctl -u sanitation-hub -f
```

### 16.2 Database Maintenance

```bash
# Run weekly VACUUM ANALYZE to maintain performance
sudo -u postgres psql -d sanitation_hub -c "VACUUM ANALYZE;"

# Check for bloated tables
sudo -u postgres psql -d sanitation_hub -c "
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"
```

### 16.3 Log Rotation

Configure log rotation to prevent log files from consuming all disk space:

```bash
sudo nano /etc/logrotate.d/sanitation-hub
```

```
/opt/sanitation-hub/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    sharedscripts
    postrotate
        systemctl kill -s USR1 sanitation-hub.service
    endscript
}
```

### 16.4 Clearing Expired JWT Tokens (Redis)

Expired JWTs in the revocation list expire automatically via Redis TTL. No manual cleanup needed.

---

## 17. Troubleshooting

### Application Won't Start

**Check Java version:**
```bash
java -version
# Must show 21 or higher
```

**Check database connectivity:**
```bash
psql -U sanitation_hub -h 127.0.0.1 -d sanitation_hub -c "SELECT 1;"
```

**Check application logs:**
```bash
sudo journalctl -u sanitation-hub -n 50 --no-pager
```

Common startup errors:
- `Could not get JDBC Connection` → Database not running or wrong credentials
- `Unable to connect to Redis` → Redis not running or wrong host/password
- `Port 8080 already in use` → Another process is using port 8080

---

### API Returns 500 Errors

1. Check application logs for the full stack trace
2. Look for `LazyInitializationException` — indicates JPA lazy loading issue
3. Look for `NullPointerException` — indicates data integrity issue
4. Check that all required tables exist: `psql -d sanitation_hub -c "\dt"`

---

### File Uploads Fail

1. Check storage directory exists and is writable:
   ```bash
   ls -la /opt/sanitation-hub/storage/
   sudo chown -R sanitation-hub:sanitation-hub /opt/sanitation-hub/storage/
   ```
2. Check Nginx `client_max_body_size` is set to `500m` or higher
3. Check Spring Boot `spring.servlet.multipart.max-file-size` is set to `500MB`

---

### LDAP Login Fails

1. Test LDAP connectivity: `ldapsearch -H ldap://ldap.unza.zm:389 -b "dc=unza,dc=zm"`
2. Verify LDAP is enabled: `app.ldap.enabled: true`
3. Check LDAP URL and base-dn match the UNZA LDAP directory structure
4. Look for LDAP errors in application log: `grep -i ldap /opt/sanitation-hub/logs/application.log`

---

### Emails Not Sending

1. Verify `MAIL_ENABLED=true` in configuration
2. Check SMTP credentials are correct
3. For Gmail: ensure App Passwords are used (not regular password)
4. Check for firewall blocking port 587
5. Look for mail errors in logs: `grep -i mail /opt/sanitation-hub/logs/application.log`

---

### High Memory Usage

1. Increase JVM heap: `-Xmx4096m` in service file
2. Enable G1 garbage collector: `-XX:+UseG1GC -XX:MaxGCPauseMillis=200`
3. Monitor with: `ps aux | grep java`

---

## 18. Security Hardening

### 18.1 Change All Default Credentials

Immediately after first deployment:
1. Change the bootstrap admin password via the admin profile page
2. Change `JWT_SECRET` to a strong random string
3. Set a Redis password
4. Use a dedicated PostgreSQL user (not `postgres`)

### 18.2 Firewall Configuration

```bash
# Ubuntu UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp     # HTTP (redirects to HTTPS)
sudo ufw allow 443/tcp    # HTTPS
# Do NOT expose port 8080 publicly
sudo ufw enable
```

### 18.3 JWT Secret Generation

```bash
# Generate a strong 64-character secret
openssl rand -hex 32
```

### 18.4 Database User Restrictions

The application database user should have minimal privileges:

```sql
-- Revoke dangerous privileges
REVOKE CREATE ON SCHEMA public FROM sanitation_hub;
REVOKE CREATEDB FROM sanitation_hub;

-- Grant only what's needed
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO sanitation_hub;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO sanitation_hub;
```

### 18.5 File Storage Outside Web Root

Ensure the storage directory is outside the Nginx document root (`/var/www/`). Never configure Nginx to serve files directly from the storage directory.

### 18.6 Production JPA Configuration

After the first successful startup (tables created), change the JPA setting to prevent accidental schema changes:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate    # Changed from 'update'
```

### 18.7 HTTPS Only

The Nginx configuration in section 7.2 already enforces HTTPS by redirecting all HTTP traffic. Ensure the `Strict-Transport-Security` header is present in the Nginx config.

### 18.8 Regular Security Updates

```bash
# Keep system packages updated
sudo apt update && sudo apt upgrade -y

# Check Java security bulletins
java -version  # Ensure latest patch version
```

---

*End of Deployment & Operations Guide*
