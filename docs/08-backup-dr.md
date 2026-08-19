# 08 — Backup & Disaster Recovery

## Objectives

| Metric | Target |
|---|---|
| RPO (recovery point objective) | ≤ 24 hours |
| RTO (recovery time objective) | ≤ 4 hours |
| Backup retention | 30 days rolling + 12 monthly snapshots |
| Off-site copy | Required (different physical site or cloud region) |

## What is backed up

| Asset | Frequency | Method |
|---|---|---|
| PostgreSQL database | Continuous WAL + nightly base | Managed PITR (cloud) or `pg_basebackup` + WAL-G (on-prem) |
| Object storage (`content-files`, `thumbnails`) | Daily incremental | Bucket replication to a second region/site, or `restic` snapshots |
| Application code | On every commit | Git remote (origin + mirror) |
| Configuration / env values | On change | Encrypted vault; quarterly export |
| Audit logs | Inherits DB backup | `audit_logs` table is part of the main schema |

## Backup procedure (on-prem reference)

```bash
# Database
pg_dump -Fc -d ubirr | restic backup --tag db --stdin --stdin-filename db.dump

# Object storage
restic backup /srv/minio/data --tag files

# Verify weekly
restic check --read-data-subset=5%
```

## Restore procedure

1. Provision a clean target environment (same Postgres major version).
2. Restore the most recent base backup, then replay WAL up to the target timestamp.
3. Restore the `content-files` bucket alongside the DB to keep file paths consistent.
4. Run smoke tests: sign-in, fetch a known-good resource detail page, trigger a signed-URL download.
5. Roll DNS to the recovered environment.

## Testing
- Backup restoration is rehearsed at least **once per quarter** on a non-production instance.
- Each rehearsal logs the actual RTO/RPO achieved and any deviations.

## Disaster scenarios

| Scenario | Response |
|---|---|
| DB corruption | PITR to the last clean transaction |
| Object store loss | Restore from off-site replica |
| Whole-site outage | DNS failover to standby environment |
| Ransomware | Restore from immutable off-site snapshots (≥ 14 days old) |
| Credential leak | Rotate Auth keys, invalidate all sessions, force password reset |
