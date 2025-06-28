
# M365 Planner Dashboard

M365 Planner is a dashboard for managing and visualizing Microsoft 365 tenant data, including users, groups, teams, licenses, SharePoint, OneDrive, and domains. It is built with Next.js (App Router), TypeScript, Prisma ORM, and Material UI (MUI).

---

## Features
- Visualize and manage Microsoft 365 data (users, groups, teams, licenses, SharePoint, OneDrive, domains)
- Dashboard UI with MUI and custom components
- Background scan jobs to sync data from Microsoft Graph
- RESTful API endpoints for each data type
- Secure, type-safe backend using Prisma ORM

---

## Architecture
- **Frontend:** Next.js (App Router), React, TypeScript, MUI
- **Backend:** Next.js API routes, Prisma ORM, Microsoft Graph API
- **Database:** SQLite (default, can be swapped)
- **Docs:** See `docs/` for API and process details

---

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in Microsoft Graph credentials and DB config.
3. **Run database migrations:**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```
4. **Start the dev server:**
   ```bash
   npm run dev
   ```
5. **Open** [http://localhost:3000](http://localhost:3000)

---

## API Endpoints & Permissions

| Endpoint                | Method | Purpose                                 | MS Graph API Endpoint(s)         | Minimum Permission |
|-------------------------|--------|-----------------------------------------|----------------------------------|--------------------|
| `/api/scan`             | GET    | Get current scan status                 | n/a                              | n/a                |
| `/api/scan`             | POST   | Start a new scan (by dataType)          | See below                        | See below          |
| `/api/data/users`       | GET    | List all users                          | `/users`                         | `User.Read.All`    |
| `/api/data/groups`      | GET    | List all groups                         | `/groups`                        | `Group.Read.All`   |
| `/api/data/teams`       | GET    | List all teams                          | `/groups` (filtered)             | `Group.Read.All`   |
| `/api/data/licenses`    | GET    | List all licenses                       | `/subscribedSkus`                | `Directory.Read.All`|
| `/api/data/sharepoint`  | GET    | List all SharePoint sites               | `/sites`                         | `Sites.Read.All`   |
| `/api/data/onedrive`    | GET    | List all OneDrive drives                | `/users/{id}/drive`              | `Files.Read.All`   |
| `/api/data/domains`     | GET    | List all domains                        | `/domains`                       | `Directory.Read.All`|

**Scan Types & Permissions:**

| Scan Type   | MS Graph Endpoint(s) Used                | Minimum Permission      |
|-------------|------------------------------------------|------------------------|
| users       | `/users`                                 | `User.Read.All`        |
| groups      | `/groups`                                | `Group.Read.All`       |
| teams       | `/groups` (filtered for Teams)           | `Group.Read.All`       |
| licenses    | `/subscribedSkus`                        | `Directory.Read.All`   |
| sharepoint  | `/sites`, `/sites/{id}/drive`            | `Sites.Read.All`       |
| onedrive    | `/users/{id}/drive`                      | `Files.Read.All`       |
| domains     | `/domains`                               | `Directory.Read.All`   |

> **Note:** All permissions listed are the lowest Microsoft Graph Application permissions required for read-only access. See [Microsoft Graph permissions reference](https://learn.microsoft.com/en-us/graph/permissions-reference) for more details.

---

## Project Structure

See [`docs/project-structure.md`](docs/project-structure.md) for a detailed breakdown.

---

## Contributing

See [`docs/`](docs/) for process, API, and data model documentation. Please update docs when adding features or endpoints.

---

## License

MIT
