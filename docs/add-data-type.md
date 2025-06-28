# How to Add a New Data Type (e.g., Microsoft Teams)

This guide outlines all the steps and files you need to update when adding a new data type to the system (for example, adding support for Microsoft Teams).

---

## 1. Update the Prisma Schema
- Edit `prisma/schema.prisma` to add new models or fields for the new data type.
- Example: Add a `teams` model if it doesn't exist.

## 2. Run Prisma Migration and Update Client
- Run the following commands:
  ```bash
  npx prisma migrate dev --name add-teams-model
  npx prisma generate
  ```
- This updates your database and regenerates the Prisma client.

## 3. Update the Scan API Handler
- Edit `app/api/scan/route.ts`:
  - Import the new Prisma type if needed.
  - Add a new scan handler function (e.g., `handleTeamsScan`).
  - Update `getScanHandlers()` to include the new handler:
    ```ts
    function getScanHandlers() {
      return {
        users: handleUsersScan,
        groups: handleGroupsScan,
        teams: handleTeamsScan, // <-- Add this line
      };
    }
    ```

## 4. Add API Route for the New Data Type
- Create a new file: `app/api/data/teams/route.ts` (replace `teams` with your data type).
- Implement GET/POST handlers to interact with the new Prisma model.

## 5. Add Dashboard Page
- Create a new page: `app/Dashboard/Teams/page.tsx` (replace `Teams` with your data type).
- Implement the UI to display/manage the new data type.

## 6. Add Link to Sidebar
- Add or update link to dashboard page in sidebar component: `app/components/sidebar.tsx` (replace `Teams` with your data type).

## 7. (Optional) Update or Add Frontend Components
- If needed, create or update components in `app/Components/` to support the new data type.

## 8. (Optional) Add or Update Tests
- Add or update tests to cover the new data type and its API endpoints.

---


## Checklist
- [ ] Update Prisma schema
- [ ] Run migration and generate client
- [ ] Update scan handler and mapping
- [ ] Add API route for new data type
- [ ] Add dashboard page
- [ ] Add/update link in Sidebar component
- [ ] Update/add frontend components (if needed)
- [ ] Add/update tests (if needed)
- [ ] Document new endpoints and permissions in `README.md` and `docs/api-overview.md`

---

**Tip:**
- Keep this document updated as the process evolves.
- Add more details or examples as needed for your team.
