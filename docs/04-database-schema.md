# 04 - Database Schema

## Source of truth

The active schema is defined by the Spring Boot JPA model classes in:

`backend/src/main/java/com/unza/ubirr/model`

Hibernate manages the schema automatically in development via:

- `spring.jpa.hibernate.ddl-auto=update`
- `spring.datasource.url=jdbc:h2:file:./data/ubirr`

## Core domains

| Domain | Main entities |
|---|---|
| Identity | `AppUser`, `UserRoleAssignment` |
| Taxonomy | `School`, `Department`, `Category`, `Tag` |
| Content | `ContentItem`, `ContentFile`, `ContentTag` |
| Events | `EventEntity` |
| Digitization | `DigitizationRecord` |
| Workflow & audit | `ApprovalWorkflow`, `AuditLog`, `Notification` |
| Usage tracking | `ViewRecord`, `DownloadRecord`, `Bookmark` |
| Personal organisation | `ReadingList`, `ReadingListItem` |
| Settings | `SystemSetting` |

## Storage model

- Structured data lives in the relational database.
- Uploaded files live on disk under the configured storage root.
- `ContentFile.filePath` stores the relative filesystem location of each uploaded asset.

## Important enums

- `AppRole`
- `AccessLevel`
- `ContentStatus`
- `ContentType`
- `DigitizationStatus`

## Relationship summary

```text
School 1---* Department
AppUser 1---* UserRoleAssignment
Category 1---* ContentItem
Department 1---* ContentItem
AppUser 1---* ContentItem
ContentItem 1---* ContentFile
ContentItem *---* Tag (through ContentTag)
ContentItem 1---* ApprovalWorkflow
ContentItem 1---* ViewRecord
ContentFile 1---* DownloadRecord
AppUser 1---* Bookmark
AppUser 1---* Notification
AppUser 1---* ReadingList
ReadingList 1---* ReadingListItem
```

## Seeding

`DataSeeder` bootstraps:

- the first administrator account
- baseline categories
- baseline system settings
