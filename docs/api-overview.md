
# API Overview

This document provides an overview of the main API endpoints, their purposes, and the minimum Microsoft Graph permissions required.

---

## API Endpoints

| Endpoint                | Method | Purpose                                 | MS Graph API Endpoint(s)         | Minimum Permission |
|-------------------------|--------|-----------------------------------------|----------------------------------|--------------------|
| `/api/scan`             | GET    | Get current scan status                 | n/a                              | n/a                |
| `/api/scan`             | POST   | Start a new scan (by dataType)          | See scan types below             | See below          |
| `/api/data/users`       | GET    | List all users                          | `/users`                         | `User.Read.All`    |
| `/api/data/groups`      | GET    | List all groups                         | `/groups`                        | `Group.Read.All`   |
| `/api/data/teams`       | GET    | List all teams                          | `/groups` (filtered)             | `Group.Read.All`   |
| `/api/data/licenses`    | GET    | List all licenses                       | `/subscribedSkus`                | `Directory.Read.All`|
| `/api/data/sharepoint`  | GET    | List all SharePoint sites               | `/sites`                         | `Sites.Read.All`   |
| `/api/data/onedrive`    | GET    | List all OneDrive drives                | `/users/{id}/drive`              | `Files.Read.All`   |
| `/api/data/domains`     | GET    | List all domains                        | `/domains`                       | `Directory.Read.All`|

---

## Scan Types & Permissions

| Scan Type   | MS Graph Endpoint(s) Used                | Minimum Permission      |
|-------------|------------------------------------------|------------------------|
| users       | `/users`                                 | `User.Read.All`        |
| groups      | `/groups`                                | `Group.Read.All`       |
| teams       | `/groups` (filtered for Teams)           | `Group.Read.All`       |
| licenses    | `/subscribedSkus`                        | `Directory.Read.All`   |
| sharepoint  | `/sites`, `/sites/{id}/drive`            | `Sites.Read.All`       |
| onedrive    | `/users/{id}/drive`                      | `Files.Read.All`       |
| domains     | `/domains`                               | `Directory.Read.All`   |

---

## Example: Start a Scan
```http
POST /api/scan
Content-Type: application/json

{
  "dataType": "users"
}
```

## Example: Get All Users
```http
GET /api/data/users
```

---

> **Note:** All permissions listed are the lowest Microsoft Graph Application permissions required for read-only access. See [Microsoft Graph permissions reference](https://learn.microsoft.com/en-us/graph/permissions-reference) for more details.
