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
## 3. Update the Modular Scan Service
 Edit `app/lib/scan.service.ts`:
  - Add a new async function for your scan logic (e.g., `export async function scanTeams() { ... }`).
  - Register your function in the `scanHandlers` map at the bottom of the file:
    ```ts
    export const scanHandlers: { [key: string]: () => Promise<void> } = {
      ...existing handlers...
      teams: scanTeams, // <-- Add this line
    };
    ```

## 4. Add API Route for the New Data Type

## 5. Add Dashboard Page

## 6. Add Link to Sidebar

## 7. (Optional) Update or Add Frontend Components

## 8. (Optional) Add or Update Tests



- [ ] Document new endpoints and permissions in `README.md` and `docs/api-overview.md`
---

- Add more details or examples as needed for your team.
