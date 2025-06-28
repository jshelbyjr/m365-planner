-- CreateTable
CREATE TABLE "SharePointSiteUsageDetail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT,
    "siteUrl" TEXT,
    "siteName" TEXT,
    "ownerDisplayName" TEXT,
    "lastActivityDate" DATETIME,
    "fileCount" INTEGER,
    "activeFileCount" INTEGER,
    "pageViewCount" INTEGER,
    "storageUsedMB" REAL,
    "storageAllocatedMB" REAL,
    "reportPeriod" TEXT,
    "reportRefreshDate" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "SharePointSiteUsageDetail_id_key" ON "SharePointSiteUsageDetail"("id");
