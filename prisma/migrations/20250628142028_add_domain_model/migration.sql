-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Domain_id_key" ON "Domain"("id");
