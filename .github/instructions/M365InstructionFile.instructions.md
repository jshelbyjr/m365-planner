---
applyTo: '**'
---

# GitHub Copilot Instructions for m365-planner

## Project Context
- This is a Next.js (App Router) project using TypeScript, Prisma ORM, and Material UI (MUI).
- The app is a dashboard for managing and visualizing Microsoft 365 data (users, groups, scan logs, etc.).
- The backend uses API routes under `app/api/`, with Prisma for database access.
- The frontend uses MUI components and custom React components for UI.

## Coding Standards
- Use TypeScript for all code (frontend and backend).
- Prefer functional React components and React hooks.
- Use async/await for all asynchronous code.
- Follow Next.js conventions for file and folder structure.
- Use Prisma for all database access; do not use raw SQL unless absolutely necessary.
- Use MUI for UI components; keep custom styling in `globals.css` or component-level styles.
- Write clear, concise, and well-typed code. Add JSDoc comments for complex logic.

## API & Data
- All API endpoints should be under `app/api/`.
- Use RESTful conventions for API design.
- Validate and sanitize all incoming data.
- Use Prisma models as the single source of truth for data shape.
- When adding new data types, update the Prisma schema and run migrations.

## Testing & Quality
- Write unit tests for all utility functions and services.
- Use integration tests for API endpoints.
- Prefer Playwright or Cypress for end-to-end tests (if/when added).
- Ensure all code passes TypeScript type checks and lints cleanly.

## UI/UX
- Use MUI components for consistency.
- Keep the UI clean, modern, and accessible.
- Use the existing Sidebar and TotalsCards components as design references.
- Prefer server-side data fetching (Next.js server components) where possible for dashboard pages.

## Documentation
- Update `docs/` with any new features, API endpoints, or data types.
- Keep `README.md` up to date with setup and usage instructions.

## General Preferences
- Be explicit and descriptive in naming (variables, functions, files).
- Keep functions small and focused.
- Avoid magic numbers and hardcoded strings; use constants or enums.
- Use environment variables for secrets and configuration.