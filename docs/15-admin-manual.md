# 15 — Administrator Manual

Audience: CICT technical administrators and the Project Administrator.

## 1. Roles you administer

| Role | Typical holder |
|---|---|
| `super_admin` | CICT lead |
| `project_admin` | Department project lead |
| `content_manager` | Faculty contributors |
| `digitization_officer` | Library / archive staff |
| `reviewer` | Subject-matter reviewers |
| `staff` / `student` | Default community accounts |

## 2. Onboarding a user
1. Ask the user to register via `/auth`. They will receive the default **Student** role.
2. In the Admin console open **Users & roles**.
3. Tick the additional role(s) for that user. Changes apply on their next page load.

## 3. Managing categories, tags, departments, schools
Use a SQL editor or the backend table editor:
```sql
INSERT INTO public.schools (name) VALUES ('School of Engineering');
INSERT INTO public.departments (name, school_id)
  VALUES ('Department of Agricultural Engineering', (SELECT id FROM public.schools WHERE name='School of Engineering'));
INSERT INTO public.categories (name, slug) VALUES ('Lab Safety', 'lab-safety');
INSERT INTO public.tags (name, slug) VALUES ('GMO', 'gmo');
```
A future admin UI will expose these flows; for now they are managed by `project_admin` via the database panel.

## 4. System settings
**Admin → Settings** lets you edit JSON values for:
- `system_name` — display name shown in the header and emails
- `max_upload_mb` — upload size cap
- `default_access_level` — initial value for new content
- `contact_email` — public contact address

Add new keys with:
```sql
INSERT INTO public.system_settings (setting_key, setting_value, description)
  VALUES ('homepage_featured_count', '6', 'How many cards on the homepage');
```

## 5. Audit log
**Admin → Audit logs** displays the most recent 200 privileged actions. For deeper queries:
```sql
SELECT * FROM public.audit_logs
WHERE created_at > now() - interval '7 days'
ORDER BY created_at DESC;
```

## 6. Storage & file management
- Files live in the `content-files` private bucket.
- Path convention: `<content_item_id>/<timestamp>-<slug>.<ext>`.
- Delete unused files via the content editor's file panel (admin only).
- Monitor bucket usage via the cloud storage panel.

## 7. Backups
Managed daily PITR is enabled by default. To restore:
1. Open the backups panel in the cloud console.
2. Pick a point-in-time within the retention window.
3. Confirm and wait for the restore (typically 5–30 minutes depending on size).
4. Re-run the post-deploy verification from the Deployment Guide.

## 8. Routine operations checklist

| Frequency | Task |
|---|---|
| Daily | Review pending-approval queue size |
| Weekly | Skim audit log for unexpected admin actions |
| Monthly | Check storage usage; archive expired content |
| Quarterly | Restore-drill from backup |
| Annually | Rotate Auth provider keys; review role assignments |

## 9. Emergencies

| Situation | Action |
|---|---|
| Locked out of admin | Use the secondary `super_admin` account; if none, contact CICT to assign the role via SQL |
| Sensitive content leaked | Re-set its `access_level` to `draft` (it disappears immediately); investigate via audit log |
| Suspected breach | Rotate Auth keys; force password reset for all admin users; review `audit_logs` and Auth provider logs |
| Data loss | Initiate restore from the most recent good backup (see §7) |
