-- CreateTable
CREATE TABLE "License" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "skuPartNumber" TEXT NOT NULL,
    "displayName" TEXT,
    "status" TEXT,
    "totalSeats" INTEGER,
    "consumedSeats" INTEGER,
    "availableSeats" INTEGER,
    "prepaidUnits" INTEGER,
    "warningUnits" INTEGER,
    "suspendedUnits" INTEGER,
    "assignedUnits" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "License_id_key" ON "License"("id");
