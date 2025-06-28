-- CreateTable
CREATE TABLE "SharePointSite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "url" TEXT,
    "teams" TEXT,
    "channelSite" BOOLEAN,
    "storageUsed" REAL,
    "hub" TEXT,
    "template" TEXT,
    "lastActivity" DATETIME,
    "dateCreated" DATETIME,
    "storageLimit" REAL,
    "storageUsedPct" REAL,
    "m365Group" TEXT,
    "filesViewedEdited" INTEGER,
    "pageViews" INTEGER,
    "pageVisits" INTEGER,
    "filesCount" INTEGER,
    "sensitivity" TEXT,
    "externalSharing" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "SharePointSite_id_key" ON "SharePointSite"("id");
