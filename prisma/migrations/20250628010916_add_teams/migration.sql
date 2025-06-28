-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT,
    "description" TEXT,
    "visibility" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_id_key" ON "Team"("id");
