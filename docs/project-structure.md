
# Project Structure

This document describes the main folders and files in the project, and their purposes.

---

## Top-Level Folders

- **app/**
  - Main application code (API routes, pages, components, dashboard, settings, etc.)
- **prisma/**
  - Prisma schema, migrations, and database files.
- **public/**
  - Static assets (images, SVGs, etc.) served directly.
- **docs/**
  - Project documentation (this folder).

## Key Subfolders in `app/`
- **api/**
  - API route handlers (e.g., `/api/scan`, `/api/data/<type>`)
- **Dashboard/**
  - Dashboard pages for each data type (e.g., `Dashboard/Groups/page.tsx`)
- **Components/**
  - Reusable React components (e.g., tables, cards, sidebar)
- **lib/**
  - Utility libraries and services (e.g., `prisma.ts`, `graph.service.ts`)
- **settings/**
  - Application settings pages

## Other Files
- **package.json**
  - Project dependencies and scripts
- **docker-compose.yml, dockerfile**
  - Docker configuration for development/deployment
- **README.md**
  - Project overview, setup, and API reference
- **tsconfig.json, next.config.ts**
  - TypeScript and Next.js configuration

---

Keep this document updated as the project evolves. See `README.md` and other docs for more details.
