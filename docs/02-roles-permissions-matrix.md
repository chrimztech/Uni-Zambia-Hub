# 02 — Roles & Permissions Matrix

Roles are stored in `public.user_roles` (separate table to prevent privilege escalation). Authorisation is enforced by:
1. PostgreSQL RLS policies that call `has_role()` / `has_any_role()` / `is_admin()` / `can_manage_content()` security-definer functions.
2. Client-side route gates (`_authenticated` layout + role checks in the admin shell).

A user may hold multiple roles simultaneously.

## Permission matrix

| Capability | Public | Student | Staff | Reviewer | Digitization Officer | Content Manager | Project Admin | Super Admin |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| View public content | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View `university` content | – | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View `staff` content | – | – | ✓ | – | – | – | ✓ | ✓ |
| View `student` content | – | ✓ | – | – | – | – | ✓ | ✓ |
| View `core_team` content | – | – | – | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create content | – | – | – | ✓ | ✓ | ✓ | ✓ | ✓ |
| Edit own draft | – | – | – | ✓ | ✓ | ✓ | ✓ | ✓ |
| Edit any content | – | – | – | – | – | – | ✓ | ✓ |
| Submit for review | – | – | – | ✓ | ✓ | ✓ | ✓ | ✓ |
| Approve / return / reject | – | – | – | ✓ | – | – | ✓ | ✓ |
| Publish | – | – | – | – | – | – | ✓ | ✓ |
| Archive | – | – | – | – | – | – | ✓ | ✓ |
| Manage events | – | – | – | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage digitization records | – | – | – | ✓ | ✓ | ✓ | ✓ | ✓ |
| Upload files | – | – | – | ✓ | ✓ | ✓ | ✓ | ✓ |
| Delete files | – | – | – | – | – | – | ✓ | ✓ |
| Manage users & roles | – | – | – | – | – | – | ✓ | ✓ |
| Manage categories / tags | – | – | – | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage departments / schools | – | – | – | – | – | – | ✓ | ✓ |
| View audit logs | – | – | – | – | – | – | ✓ | ✓ |
| Edit system settings | – | – | – | – | – | – | ✓ | ✓ |

`can_manage_content()` = any of {reviewer, digitization_officer, content_manager, project_admin, super_admin}.  
`is_admin()` = any of {project_admin, super_admin}.
