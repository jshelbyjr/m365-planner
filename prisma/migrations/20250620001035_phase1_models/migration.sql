-- CreateTable
CREATE TABLE "Scan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "status" TEXT NOT NULL,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "error" TEXT
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT,
    "userPrincipalName" TEXT,
    "accountEnabled" BOOLEAN,
    "department" TEXT,
    "jobTitle" TEXT
);

-- CreateTable
CREATE TABLE "M365Group" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT,
    "mailNickname" TEXT,
    "memberCount" INTEGER,
    "visibility" TEXT
);

-- CreateTable
CREATE TABLE "SecurityGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT,
    "isDistributionGroup" BOOLEAN NOT NULL,
    "memberCount" INTEGER
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "M365Group_id_key" ON "M365Group"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SecurityGroup_id_key" ON "SecurityGroup"("id");
