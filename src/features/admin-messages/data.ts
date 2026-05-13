import prisma from "@/infrastructure/db/prisma";

export type AdminInboxRow = {
  id: string;
  title: string;
  body: string;
  readAt: Date | null;
  createdAt: Date;
};

export async function countUnreadAdminMessages(recipientUserId: string): Promise<number> {
  return prisma.adminInboxMessage.count({
    where: { recipientUserId, readAt: null },
  });
}

export async function listAdminMessagesForUser(recipientUserId: string, take = 30): Promise<AdminInboxRow[]> {
  return prisma.adminInboxMessage.findMany({
    where: { recipientUserId },
    orderBy: { createdAt: "desc" },
    take,
    select: { id: true, title: true, body: true, readAt: true, createdAt: true },
  });
}
