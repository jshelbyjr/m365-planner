-- CreateTable
CREATE TABLE "PowerPlatformEnvironment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "type" TEXT,
    "region" TEXT,
    "capacity" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PowerApp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "type" TEXT,
    "environmentId" TEXT NOT NULL,
    "ownerId" TEXT,
    "lastAccessed" DATETIME,
    "connection" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PowerApp_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "PowerPlatformEnvironment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PowerApp_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PowerAutomateFlow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "environmentId" TEXT NOT NULL,
    "ownerId" TEXT,
    "lastRunTime" DATETIME,
    "connection" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PowerAutomateFlow_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "PowerPlatformEnvironment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PowerAutomateFlow_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PowerPlatformEnvironment_id_key" ON "PowerPlatformEnvironment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PowerApp_id_key" ON "PowerApp"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PowerAutomateFlow_id_key" ON "PowerAutomateFlow"("id");
