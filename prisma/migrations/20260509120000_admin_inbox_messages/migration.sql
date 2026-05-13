-- CreateTable
CREATE TABLE "AdminInboxMessage" (
    "id" TEXT NOT NULL,
    "recipientUserId" TEXT NOT NULL,
    "senderUserId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminInboxMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AdminInboxMessage_recipientUserId_readAt_idx" ON "AdminInboxMessage"("recipientUserId", "readAt");

CREATE INDEX "AdminInboxMessage_recipientUserId_createdAt_idx" ON "AdminInboxMessage"("recipientUserId", "createdAt");

ALTER TABLE "AdminInboxMessage" ADD CONSTRAINT "AdminInboxMessage_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AdminInboxMessage" ADD CONSTRAINT "AdminInboxMessage_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
