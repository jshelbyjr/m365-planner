# API Overview

This document provides an overview of the main API endpoints in the project, their purposes, and example usage.

---

## Scan API
- **Endpoint:** `/api/scan`
- **Methods:**
  - `GET`: Get the current scan status
  - `POST`: Start a new scan (body: `{ dataType: 'users' | 'groups' | ... }`)
- **Purpose:**
  - Manages background scans for different data types (users, groups, etc.)

## Data APIs
- **Endpoint:** `/api/data/<type>`
- **Methods:**
  - `GET`: Fetch all records of the given type
  - `POST`: Add a new record (if supported)
- **Purpose:**
  - CRUD operations for each data type (e.g., users, groups, teams)

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

Add more endpoints and details as the API grows.
