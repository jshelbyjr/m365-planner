-- CreateTable
CREATE TABLE "OneDrive" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT,
    "ownerName" TEXT,
    "siteName" TEXT,
    "siteUrl" TEXT,
    "size" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "OneDrive_id_key" ON "OneDrive"("id");
