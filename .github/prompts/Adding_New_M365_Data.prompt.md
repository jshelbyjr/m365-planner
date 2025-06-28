---
mode: 'agent'
---
Prisma Schema

Add a new model to schema.prisma with all required fields.
Run npx prisma migrate dev --name add_<component>_model to update the database.
API Routes

Create a new API route under route.ts:
Implement GET to list all items.
Implement POST to add a new item.
(Optional) Implement a PUT or /refresh endpoint to fetch and upsert data from Microsoft Graph.
Microsoft Graph Service

Add a function in graph.service.ts to fetch the required data from Microsoft Graph.
Ensure the function returns the correct fields and handles paging/errors.
Dashboard Page

Create a new dashboard page at page.tsx:
Use MUI and custom components for UI consistency.
Fetch and display the data in a table.
Add export and scan/refresh functionality if needed.
Main Dashboard Totals

Update page.tsx to fetch the new data and add a total card to the TotalsCards component.
Sidebar Navigation

Update Sidebar.tsx to add a navigation link to the new dashboard page.
Testing & Validation

Check for TypeScript and lint errors.
Test all new and updated routes and UI components.