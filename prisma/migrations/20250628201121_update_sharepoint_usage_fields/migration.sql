/*
  Warnings:

  - You are about to drop the column `storageAllocatedMB` on the `SharePointSiteUsageDetail` table. All the data in the column will be lost.
  - You are about to drop the column `storageUsedMB` on the `SharePointSiteUsageDetail` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SharePointSiteUsageDetail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT,
    "siteUrl" TEXT,
    "ownerDisplayName" TEXT,
    "isDeleted" BOOLEAN,
    "lastActivityDate" DATETIME,
    "fileCount" INTEGER,
    "activeFileCount" INTEGER,
    "pageViewCount" INTEGER,
    "visitedPageCount" INTEGER,
    "storageUsedBytes" BIGINT,
    "storageAllocatedBytes" BIGINT,
    "rootWebTemplate" TEXT,
    "ownerPrincipalName" TEXT,
    "reportPeriod" TEXT,
    "reportRefreshDate" DATETIME,
    "siteName" TEXT
);
INSERT INTO "new_SharePointSiteUsageDetail" ("activeFileCount", "fileCount", "id", "lastActivityDate", "ownerDisplayName", "pageViewCount", "reportPeriod", "reportRefreshDate", "siteId", "siteName", "siteUrl") SELECT "activeFileCount", "fileCount", "id", "lastActivityDate", "ownerDisplayName", "pageViewCount", "reportPeriod", "reportRefreshDate", "siteId", "siteName", "siteUrl" FROM "SharePointSiteUsageDetail";
DROP TABLE "SharePointSiteUsageDetail";
ALTER TABLE "new_SharePointSiteUsageDetail" RENAME TO "SharePointSiteUsageDetail";
CREATE UNIQUE INDEX "SharePointSiteUsageDetail_id_key" ON "SharePointSiteUsageDetail"("id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
