# 11 — Risks & Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|:---------:|:------:|------------|
| R1 | 8-week timeline slips because content team is unavailable | High | High | Lock weekly review slots in Week 1; deliver MVP-only scope; defer non-MVP modules |
| R2 | Storage growth exceeds budget | Medium | High | Apply storage formula quarterly; enforce per-content size limits; transcode video to web-optimised codecs |
| R3 | Copyright disputes on published academic material | Medium | High | Mandatory `copyright_status` and `licence_information` fields; explicit approval step records reviewer name |
| R4 | Privilege-escalation bug in RLS | Low | Critical | Roles in separate table; integration tests for every policy; quarterly external review |
| R5 | Loss of digitised originals (no scan kept) | Medium | High | Require both scanned file and physical-location field; quarterly archive audit |
| R6 | Sustained DDoS or scraping against public portal | Low | Medium | Edge rate limiting; CDN caching of read-only endpoints |
| R7 | Loss of project administrator account | Low | High | At least two `super_admin` accounts at all times; recovery procedure documented |
| R8 | Backup never tested → unrecoverable in incident | Medium | Critical | Quarterly restore drills; sign-off in operations log |
| R9 | Sensitive content tagged `public` by mistake | Medium | High | Default access level = `draft`; publish requires admin role; audit log surfaces every publish |
| R10 | Long-term maintenance funding lapses | Medium | High | Document sustainability plan; transfer ownership to CICT at handover |
| R11 | Off-campus access blocked by University firewall | Low | Medium | Coordinate hostname and firewall rules with CICT in Week 1 |
| R12 | Hard-coded secret accidentally committed | Low | Critical | `.env` excluded; secret-scanning enabled on the repository; rotate on any leak |
