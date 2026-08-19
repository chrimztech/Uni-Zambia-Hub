# 07 — Infrastructure Plan

## 1. Hosting options considered

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **Existing CICT virtual server** | No new procurement; predictable | Limited storage; shared resources; CICT staff time | Acceptable as a temporary host |
| **Dedicated physical server (on-prem)** | Full control; one-off cost | Capex; maintenance burden; power/cooling; off-campus access requires public IP & firewall work | Best long-term if budget approved |
| **Cloud (Lovable Cloud / managed)** | Managed DB, auth, storage; auto-backup; CDN; zero-ops | Recurring cost; data residency considerations | **Recommended for MVP and Year 1** |
| **Hybrid** (cloud app + on-prem media) | Cost optimisation for large media | Operational complexity | Re-evaluate in Year 2 |

**Recommendation.** Deploy on Lovable Cloud for the MVP. Re-evaluate at month 6 with real usage data; migrate to on-prem only if growth or policy requires it.

## 2. Logical environment

| Tier | MVP (Lovable Cloud) | On-prem alternative |
|---|---|---|
| Edge / HTTP | Cloudflare Workers | Nginx 1.24+ |
| App runtime | Workers V8 isolate (Node-compat) | Node 20 LTS or Bun |
| Database | Managed PostgreSQL 15 | PostgreSQL 15 on Ubuntu 22.04 LTS |
| File storage | Managed S3-compatible | MinIO cluster |
| Auth | Managed GoTrue | Self-hosted GoTrue |
| TLS | Cloudflare-managed | Let's Encrypt via certbot |
| Backups | Managed daily PITR | `pg_dump` + `restic` to off-site |

## 3. Minimum server specifications (on-prem alternative)

For 200 concurrent users, 50 000 content items, 5 TB of media:

| Server | CPU | RAM | Disk | Notes |
|---|---|---|---|---|
| App | 4 vCPU | 8 GB | 100 GB SSD | Behind Nginx |
| DB | 8 vCPU | 32 GB | 500 GB NVMe + 2× for backups | tuned for `shared_buffers = 8GB` |
| Storage (MinIO) | 4 vCPU | 16 GB | 4× 4 TB HDD (RAID-10) | scale-out node |
| Backup | 2 vCPU | 4 GB | ≥ 2× DB size | Off-site recommended |

## 4. Storage sizing formula

```
total_storage_GB
   = (videos × avg_video_GB)
   + (audio × avg_audio_GB)
   + (pdfs × avg_pdf_MB / 1024)
   + (images × avg_image_MB / 1024)
   + (digitised_pages × ~0.5 MB / 1024)
required_storage_GB = total_storage_GB × growth_multiplier × backup_multiplier × retention_years
```

| Variable | Suggested starting value |
|---|---|
| `growth_multiplier` | 2 (one-year head room) |
| `backup_multiplier` | 1.5 (primary + 0.5 differential) |
| `retention_years` | 5 |

**Example (modest year-1 scenario).**
- 200 videos × 0.5 GB = 100 GB
- 300 audio × 0.05 GB = 15 GB
- 2 000 PDFs × 3 MB = 6 GB
- 5 000 images × 1.5 MB = 7.5 GB
- 10 000 scanned pages × 0.5 MB = 5 GB

Total ≈ 134 GB × 2 × 1.5 × 5 = **~2 TB provisioned**.

Re-run the formula quarterly using real numbers from `system_settings` storage report.

## 5. Networking & access
- Public hostname (suggested): `biosafety.unza.zm` or `repository.unza.zm`.
- HTTPS only; HSTS; HTTP/2.
- Off-campus access permitted via the public hostname.
- IP allow-listing optional for the admin console (defer to CICT policy).

## 6. Monitoring
- Cloud-native: built-in DB / Workers metrics, logs panel.
- On-prem: Prometheus + Grafana, alertmanager → email/Slack.
- Uptime: external check (UptimeRobot or equivalent) every 5 minutes.
- Disk-usage alert at 70 %, 85 %, 95 %.
