# UNZA Sanitation Hub — System Administrator & Content Manager Manual

**Version:** 1.0  
**Date:** July 2026  
**Audience:** System Administrators, Project Administrators, Content Managers, Reviewers  
**System:** UNZA Decentralized Sanitation Systems Hub

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Admin Dashboard](#2-admin-dashboard)
3. [Content Management](#3-content-management)
4. [Approval Workflow](#4-approval-workflow)
5. [Events Management](#5-events-management)
6. [Training Sessions](#6-training-sessions)
7. [Demonstration Sites](#7-demonstration-sites)
8. [Digitization Records](#8-digitization-records)
9. [User Management](#9-user-management)
10. [Taxonomy Management](#10-taxonomy-management)
11. [System Settings](#11-system-settings)
12. [Reports & Analytics](#12-reports--analytics)
13. [Audit Logs](#13-audit-logs)
14. [Backup & Recovery](#14-backup--recovery)
15. [Role Reference](#15-role-reference)

---

## 1. Getting Started

### 1.1 Accessing the Admin Panel

1. Navigate to the system URL (e.g., `https://hub.unza.ac.zm`)
2. Click **Sign In** in the top-right corner
3. Select the appropriate login tab:
   - **UNZA Staff/Student** — log in with your UNZA ID and portal password
   - **Email** — log in with your registered email and password
4. After signing in, click your name or the **Admin** button to access the admin workspace

The admin panel is accessible at `/admin` and is only visible to users with administrative roles.

### 1.2 Default Admin Account

On first deployment, the system creates a bootstrap administrator account:
- **Email:** `admin@sanitation-hub.local` (configurable via `ADMIN_EMAIL`)
- **Password:** `Admin@123456` (configurable via `ADMIN_PASSWORD`)

**Important:** Change this password immediately after first login via your profile page.

### 1.3 Admin Navigation Sidebar

The sidebar is organized into sections:

| Section | Menu Items |
|---------|-----------|
| (Top) | Dashboard |
| Content | Resources, Approvals, Digitization |
| Community | Events, Demo Sites |
| Analytics | Reports |
| System | Categories & Types, Users & Roles, Audit Logs, Settings |

Items marked as **admin-only** (Users & Roles, Audit Logs, Settings) are only visible to SUPER_ADMIN and PROJECT_ADMIN roles.

---

## 2. Admin Dashboard

The dashboard provides a real-time overview of platform activity.

### 2.1 Key Metrics

The dashboard displays six summary cards:

| Card | Description |
|------|-------------|
| Total Resources | All content items in the system regardless of status |
| Published | Resources currently live and accessible |
| Drafts | Content being worked on, not yet submitted |
| Pending Approval | Submitted content awaiting review |
| Published Events | Active events visible to the public |
| Digitization Records | Total archiving projects tracked |

### 2.2 Recent Activity

The dashboard shows the 8 most recently updated content items with their current status. Click any item title to open it in the content editor.

### 2.3 Quick Actions

From the dashboard you can:
- Click **Resources** to view all content
- Click **Approvals** to see items awaiting your review
- Use the sidebar links to navigate to any section

---

## 3. Content Management

The Content Management page (`/admin/content`) is the central workspace for all resource management.

### 3.1 Viewing Content

Content is displayed in a table with columns for:
- Title and type
- Status badge (Draft, Submitted, Approved, Published, etc.)
- Access level (Public, University, Staff, etc.)
- Last updated date
- Action buttons

**Filtering by Status:**  
Use the status filter tabs at the top to view:
- **All** — every content item
- **Draft** — unpublished work in progress
- **Pending** — submitted for review
- **Approved** — approved and ready to publish
- **Published** — live content
- **Archived** — retired content

### 3.2 Creating New Content

Click **New Resource** (or the `+` button) to open the content creation form.

#### Required Fields
- **Title** — the resource's display name (used to auto-generate the URL slug)
- **Content Type** — select from the taxonomy (report, policy, journal_article, training_material, etc.)

#### Optional but Recommended Fields
- **Slug** — URL-friendly identifier (auto-generated from title if left blank)
- **Summary** — short description shown in listings and search results (250 characters max recommended)
- **Body** — full text content (supports rich HTML)
- **Access Level** — who can see this resource:
  - **Public** — anyone, including anonymous visitors
  - **University** — any authenticated UNZA member
  - **Staff** — UNZA staff only
  - **Student** — UNZA students
  - **Core Team** — administrators only
  - **Draft** — author and reviewers only (default for new content)
- **Category** — content category from the taxonomy
- **Department** — associated UNZA department
- **Authors** — display name(s) of the actual authors
- **Publisher** — publishing institution or body
- **Publication Date** — original publication date (may differ from when uploaded)
- **Language** — document language (default: English)
- **Keywords** — comma-separated search keywords
- **Copyright Status** — e.g., "Open Access", "All Rights Reserved", "CC-BY 4.0"
- **Licence Information** — specific licence details
- **External Identifier** — DOI, ISBN, or other reference number
- **Source Institution** — originating organisation
- **Downloadable** — whether users can download attached files

#### Saving

Click **Save Draft** to save without submitting. The content will be in **DRAFT** status and only visible to you and administrators.

### 3.3 Uploading Files

After saving a content item, the **Files** panel appears below the form.

1. Click **Upload File**
2. Select one or more files from your computer
3. Files are uploaded immediately and appear in the list
4. Each file shows: filename, type icon, size, and action buttons (preview, delete)

**File Size Limit:** 500 MB per file (configurable)

**Supported Formats:** PDF, Word, Excel, PowerPoint, images, video, audio, ZIP, and more

To **delete a file**, click the trash icon next to it. This permanently removes the file from storage.

### 3.4 Adding a Thumbnail

A thumbnail appears in resource cards across the site (library listing, homepage, search results).

1. In the **Thumbnail** section, click **Upload Thumbnail**
2. Select an image file (JPEG or PNG recommended, at least 400×300px)
3. The thumbnail is saved immediately and shown as a preview

To replace a thumbnail, upload a new one — the old one is automatically deleted.

### 3.5 Editing Content

Click the **Edit** (pencil) icon on any content row to open it in the editor. All fields are editable. Changes are saved when you click **Save**.

> Note: Published content can be edited. Changes do not affect the published state — the content remains live while you edit it.

### 3.6 Deleting Content

Content can only be deleted if it is in **DRAFT** status. Click the **Delete** (trash) icon on a draft item.

> To remove published content from public view, use **Archive** instead of Delete.

---

## 4. Approval Workflow

The system uses a structured approval pipeline to ensure quality control before content is published.

### 4.1 Workflow States

```
DRAFT → SUBMITTED → APPROVED → PUBLISHED
                 ↘ RETURNED → (author revises) → SUBMITTED
                 ↘ REJECTED
```

### 4.2 Submitting for Review (Staff/Content Managers)

When content is ready for review:
1. Open the content item
2. Click **Submit for Review**
3. The content moves to **SUBMITTED** status
4. Reviewers are notified via the notification system

### 4.3 Reviewing Submitted Content (Reviewers/Admins)

Navigate to **Approvals** in the sidebar to see all content awaiting review.

For each item, you can:
- **Preview** — view the content as it will appear to users
- **Approve** — mark as approved and ready for publishing
- **Return** — send back to the author with comments for revision

When returning content:
1. Click **Return**
2. Enter your feedback comments in the dialog
3. The author receives a notification with your comments

### 4.4 Publishing Content (Admins/Content Managers)

Once a content item is **APPROVED**:
1. Open the content item in the editor
2. Click **Publish**
3. Confirm the action
4. The content moves to **PUBLISHED** status and is immediately visible based on its access level

### 4.5 Archiving Content

To remove published content from public view without deleting it:
1. Open the content item
2. Click **Archive**
3. The content moves to **ARCHIVED** status and is no longer visible to users

Archived content remains in the system and can be found using the **Archived** filter.

---

## 5. Events Management

### 5.1 Creating an Event

Navigate to **Events** → **New Event**.

#### Required Fields
- **Title** — event name
- **Start Date** — date the event begins

#### Recommended Fields
- **Slug** — URL identifier (auto-generated)
- **Description** — full event description
- **Venue** — physical or online location
- **End Date** — if multi-day
- **Start/End Time** — event times
- **Organizer** — organizing body or department
- **Contact Email** — for enquiries
- **Registration Link** — external registration URL (optional)
- **Access Level** — who can see the event

### 5.2 Publishing an Event

New events are created as **DRAFT**. To make them public:
1. Open the event
2. Set **Status** to **Published** in the status field, or
3. Click **Publish** if the button is available

### 5.3 Editing and Deleting Events

- **Edit:** Click the pencil icon on any event row
- **Delete:** Click the trash icon (only admins can delete events)

---

## 6. Training Sessions

Training sessions are capacity-building programmes that users can register for through their account.

### 6.1 Creating a Training Session

Navigate to **Training** → **New Training Session**.

#### Fields
- **Title** — session name
- **Mode** — Online, In-Person, or Hybrid
- **Venue** — location (for in-person/hybrid)
- **Instructor** — facilitator name(s)
- **Start/End Date** — session dates
- **Start/End Time** — session times
- **Capacity** — maximum number of participants (leave blank for unlimited)
- **Description** — what participants will learn
- **Requirements** — prerequisites or materials needed
- **Contact Email** — who to contact for enquiries

### 6.2 Publishing a Training Session

New sessions are created as **DRAFT**. Click **Publish** to make them available for registration.

Published sessions appear on the public Training page and are available for registration by logged-in users.

### 6.3 Managing Registrations

Click **Registrations** on any published session to see the list of registered participants:
- Participant name and email
- Registration date
- Status (Registered, Cancelled, Attended)

You can export the registration list for attendance tracking.

---

## 7. Demonstration Sites

The Demonstration Sites section maintains a registry of physical sanitation installation sites across Zambia.

### 7.1 Adding a Site

Navigate to **Demo Sites** → **New Site**.

#### Fields
- **Name** — site name
- **Slug** — URL identifier
- **Location** — physical address
- **District** — administrative district
- **Site Type** — University Campus, Health Facility, Community, School, etc.
- **Technology** — e.g., Biodigester, Constructed Wetlands, DEWATS, FSTP, UDDT
- **Operational Status** — Active, Inactive, Under Construction
- **Operational Since** — date the site became operational
- **Coordinates** — latitude and longitude (for map display)
- **Contact Person** — site contact
- **Contact Email** — contact email
- **Partner Institution** — co-implementing organisation
- **Description** — full description
- **Notes** — internal operational notes

### 7.2 Editing and Deleting Sites

- **Edit:** Click the pencil icon on any site row
- **Delete:** Click the trash icon (admin only)

---

## 8. Digitization Records

The Digitization module tracks the conversion of physical documents into digital format.

### 8.1 Creating a Digitization Record

Navigate to **Digitization** → **New Record**.

#### Fields
- **Title** — document title
- **Description** — content description
- **Source Owner** — original owner/holder of the document
- **Physical Location** — archive location (shelf, box, folder reference)
- **Number of Pages** — total pages to digitize
- **Status** — Pending, In Progress, Completed, Failed
- **Scanned File Path** — path to the scanned output file (once completed)
- **OCR Text** — extracted text content (from OCR processing)
- **Quality Status** — Good, Fair, Poor
- **Copyright Status** — rights information
- **Linked Content Item** — once digitized, link to a published content item

### 8.2 Workflow

1. Create a record for each physical document to be digitized
2. Set status to **In Progress** when scanning begins
3. Upload the scanned file and run OCR
4. Set status to **Completed** when done
5. Create a **Content Item** from the digitized document
6. Link the content item back to the digitization record

---

## 9. User Management

*Available to SUPER_ADMIN and PROJECT_ADMIN only.*

### 9.1 Viewing Users

Navigate to **Users & Roles** to see all registered users with:
- Name and email
- Account status (Active, Pending, Suspended)
- Assigned roles
- Registration date
- Last login date

### 9.2 Assigning Roles

1. Find the user in the list
2. Click **Edit Roles** (or the role icon)
3. Select/deselect roles from the list:
   - SUPER_ADMIN
   - PROJECT_ADMIN
   - CONTENT_MANAGER
   - DIGITIZATION_OFFICER
   - REVIEWER
   - STAFF
   - STUDENT
4. Click **Save**

> Users can hold multiple roles simultaneously. The most privileged role determines their access level.

### 9.3 Managing Account Status

To **suspend** a user (prevent login without deleting their account):
1. Find the user in the list
2. Click the status toggle or **Suspend**
3. The account status changes to **Suspended**

To **reactivate** a suspended account:
1. Find the suspended user
2. Click **Activate**
3. The status returns to **Active**

> Pending accounts are those where the user registered but has not yet verified their email.

### 9.4 Role Guidelines

| When to assign | Role |
|----------------|------|
| Full system access, system configuration, all content | SUPER_ADMIN |
| Oversee platform, manage users, approve content | PROJECT_ADMIN |
| Create, manage, and publish research content | CONTENT_MANAGER |
| Handle physical-to-digital document conversion | DIGITIZATION_OFFICER |
| Review and quality-check submitted content | REVIEWER |
| UNZA faculty/staff creating content | STAFF |
| UNZA students accessing resources | STUDENT |

---

## 10. Taxonomy Management

*Available to SUPER_ADMIN and PROJECT_ADMIN only.*

The taxonomy system controls the controlled vocabularies used to classify content.

Navigate to **Categories & Types** to manage:

### 10.1 Categories

Categories classify content by topic area. Examples:
- Sanitation Policy
- Water Quality
- Hygiene Promotion
- Wastewater Management
- Laboratory Practices
- Research & Data
- Training Materials

**Adding a category:**
1. Select the **Categories** tab
2. Click **New Category**
3. Enter Name, Slug (auto-generated), and Description
4. Click **Save**

### 10.2 Content Types

Content types define the format of a resource. Examples:
- article, report, policy, guidelines, standards
- manual, training_material, presentation, case_study
- research_data, dataset, spreadsheet, journal_article
- thesis, video, audio, image, gallery, pdf

**Adding a content type:**
1. Select the **Content Types** tab
2. Click **New Type**
3. Enter Name and Slug (auto-generated, lowercase with underscores)
4. Click **Save**

### 10.3 Departments

Academic departments used to associate content with a UNZA department.

### 10.4 Schools

Schools (faculties) that departments belong to.

### 10.5 Tags

Free-form tags for additional content classification. Tags are simpler than categories and can be applied more flexibly.

---

## 11. System Settings

*Available to SUPER_ADMIN and PROJECT_ADMIN only.*

Navigate to **Settings** to configure platform-wide behaviour.

### 11.1 Available Settings

| Setting Key | Description | Example Values |
|-------------|-------------|---------------|
| system_name | Platform display name | "UNZA Sanitation Hub & Laboratory Repository" |
| system_abbreviation | Short identifier | "SANITATION-HUB" |
| max_upload_mb | Maximum file upload size | 500 |
| default_access_level | Default access level for new content | "draft" |
| contact_email | Public contact email address | "sanitation@unza.zm" |
| allow_public_registration | Allow anyone to create an account | true / false |
| require_approval_before_publish | Enforce review workflow | true / false |
| download_requires_login | Require login to download files | true / false |

### 11.2 Editing a Setting

1. Find the setting in the list
2. Click **Edit** on that row
3. Enter the new value
4. Click **Save**

> **Important:** Values are stored as JSON strings. Boolean values should be `true` or `false` (without quotes). Text values should be in quotes: `"sanitation@unza.zm"`.

---

## 12. Reports & Analytics

*Available to SUPER_ADMIN, PROJECT_ADMIN, and CONTENT_MANAGER.*

Navigate to **Reports** for platform analytics.

### 12.1 Summary Statistics

The reports page shows:
- Total resources by status (published, draft, pending, archived)
- Total events and training sessions
- Registered user count
- Files stored and total storage used
- Total page views and downloads
- Content breakdown by type (e.g., 12 journal articles, 9 reports)

### 12.2 Recent Content Activity

A list of the 8 most recently updated content items.

### 12.3 Downloading Reports

Click **Download CSV** to export a full content report as a spreadsheet.  
Click **Download PDF** to export a formatted summary report.

---

## 13. Audit Logs

*Available to SUPER_ADMIN and PROJECT_ADMIN only.*

The Audit Log is an immutable record of all significant system actions. Navigate to **Audit Logs**.

### 13.1 What is Logged

Every administrative action is recorded, including:
- Content created, updated, deleted, published, archived
- User roles changed
- User status changes
- Settings updated
- Files uploaded or deleted
- Taxonomy items created, updated, deleted

### 13.2 Reading the Audit Log

Each log entry shows:
- **Timestamp** — when the action occurred
- **User** — who performed the action (or "System" for automated actions)
- **Action** — what was done (e.g., `content.publish`, `user.roles.update`)
- **Entity Type** — what was affected (e.g., `content_items`, `users`)
- **Entity ID** — the ID of the affected record

> The audit log cannot be modified or deleted. It exists for compliance and accountability.

---

## 14. Backup & Recovery

*Available to SUPER_ADMIN only.*

Navigate to **Backup** to manage system backups.

### 14.1 Types of Backups

| Type | Contents | Use Case |
|------|---------|----------|
| Database Backup | Full PostgreSQL dump (.sql) | Data recovery |
| Files Backup | All uploaded content files (.zip) | File recovery |
| Full Backup | Database + files (.zip) | Complete system recovery |

### 14.2 Creating a Backup

1. Click **Database Backup**, **Files Backup**, or **Full Backup**
2. The system generates the backup file (this may take a few minutes for large datasets)
3. The backup appears in the list with filename, size, and creation timestamp

### 14.3 Downloading a Backup

1. Find the backup in the list
2. Click **Download** to save the file to your computer
3. Store backup files in a secure off-site location

### 14.4 Deleting Old Backups

1. Find the backup in the list
2. Click **Delete** to remove it from the server

> Keep at least 3 recent backups at all times. Schedule weekly backups minimum; daily for active systems.

### 14.5 Restoring from Backup

**Database Restore:**

```bash
# Stop the application
# Restore PostgreSQL dump
psql -U sanitation_hub -d sanitation_hub < db-backup-YYYYMMDD.sql
# Restart the application
```

**Files Restore:**

```bash
# Extract the files ZIP to the storage root
unzip files-backup-YYYYMMDD.zip -d /opt/sanitation-hub/storage/
```

---

## 15. Role Reference

### Quick Role Reference Card

| Role | Login | Dashboard | Create Content | Review | Publish | Users | Settings | Backup |
|------|-------|-----------|---------------|--------|---------|-------|----------|--------|
| SUPER_ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| PROJECT_ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| CONTENT_MANAGER | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| REVIEWER | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| DIGITIZATION_OFFICER | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| STAFF | ✓ | ✗ | ✓ (own only) | ✗ | ✗ | ✗ | ✗ | ✗ |
| STUDENT | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

### Assigning the Right Role

- **New UNZA staff joining the platform** → STAFF
- **Researcher who will upload and manage their own papers** → STAFF (or CONTENT_MANAGER if they manage others' content too)
- **Department administrator managing all departmental content** → CONTENT_MANAGER
- **Faculty member tasked with reviewing submissions** → REVIEWER
- **Library staff doing document scanning** → DIGITIZATION_OFFICER
- **IT administrator or platform manager** → SUPER_ADMIN or PROJECT_ADMIN

---

*End of Admin User Manual*
