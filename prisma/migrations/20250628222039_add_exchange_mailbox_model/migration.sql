-- CreateTable
CREATE TABLE "ExchangeMailbox" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT,
    "isDeleted" BOOLEAN,
    "deletedDate" DATETIME,
    "createdDate" DATETIME,
    "lastActivityDate" DATETIME,
    "itemCount" INTEGER,
    "storageUsedBytes" BIGINT,
    "issueWarningQuotaBytes" BIGINT,
    "prohibitSendQuotaBytes" BIGINT,
    "prohibitSendReceiveQuotaBytes" BIGINT,
    "deletedItemCount" INTEGER,
    "deletedItemSizeBytes" BIGINT,
    "deletedItemQuotaBytes" BIGINT,
    "hasArchive" BOOLEAN,
    "recipientType" TEXT,
    "reportPeriod" TEXT,
    "reportRefreshDate" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeMailbox_id_key" ON "ExchangeMailbox"("id");
