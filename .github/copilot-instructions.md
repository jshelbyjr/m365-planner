# GitHub Copilot Instructions for m365-planner

## Core Commands
- **Development:** `npm run dev` (Next.js dev server)
- **Build:** `npm run build` (Next.js production build)
- **Start:** `npm run start` (start production server)
- **Lint:** `npm run lint` (ESLint)
- **Prisma Migrations:**
  - `npx prisma migrate dev --name <desc>` (run migration)
  - `npx prisma generate` (generate client)
- **Testing:**
  - *No test scripts detected in `package.json`* (add if/when tests are implemented)

## High-Level Architecture
- **Framework:** Next.js (App Router, TypeScript)
- **UI:** Material UI (MUI), custom React components
- **ORM:** Prisma (SQLite, see `prisma/schema.prisma`)
- **API:** RESTful endpoints under `app/api/` (per data type)
- **Data Models:** Users, Groups, Teams, Licenses, SharePoint, OneDrive, ScanLog, etc. (see Prisma schema)
- **External APIs:** Microsoft Graph (via `@microsoft/microsoft-graph-client`)
- **Services:**
  - `lib/prisma.ts`: Prisma client
  - `lib/graph.service.ts`: Microsoft Graph integration

## Repo-Specific Style Rules
- **Language:** TypeScript everywhere (frontend & backend)
- **React:** Functional components, React hooks, server components for dashboard pages
- **UI:** Use MUI components; custom styles in `globals.css` or component-level styles
- **Data Access:** Use Prisma only (no raw SQL unless necessary)
- **API:**
  - All endpoints under `app/api/`
  - RESTful conventions
  - Validate & sanitize all incoming data
  - Use Prisma models as source of truth
- **Naming:** Explicit, descriptive names for variables, functions, files
- **Functions:** Small, focused, well-typed; avoid magic numbers/strings (use constants/enums)
- **Error Handling:** Handle errors gracefully; validate inputs
- **Config/Secrets:** Use environment variables
- **Formatting:** Follow project lint rules; keep imports clean

## Docs & Process
- **Docs:**
  - `docs/` for API, project structure, adding data types
  - Update docs and `README.md` with new features, endpoints, or data types
- **Adding Data Types:**
  - Update Prisma schema & migrate
  - Add/extend API route
  - Add dashboard page/component
  - Update/add tests (if present)
- **Testing:**
  - Unit tests for utilities/services
  - Integration tests for API endpoints
  - E2E: Playwright/Cypress (if/when added)
- **Quality:**
  - All code must pass TypeScript checks and lint cleanly

## Directory Structure (Summary)
- `app/` — Main app code (API, pages, components)
- `prisma/` — Schema, migrations, DB
- `public/` — Static assets
- `docs/` — Project documentation

---
Keep this file concise and up to date. See `docs/` for detailed process and API info.
