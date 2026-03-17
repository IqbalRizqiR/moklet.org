import prisma from "@/lib/prisma";
import { PaginatedResult } from "@/utils/paginator";

// Create a notification and link recipients
export const createNotification = async ({
  type,
  title,
  message,
  targetUrl,
  actorId,
  recipientIds,
}: {
  type: string;
  title: string;
  message: string;
  targetUrl?: string;
  actorId: string;
  recipientIds: string[];
}) => {
  return await prisma.notification.create({
    data: {
      type,
      title,
      message,
      target_url: targetUrl,
      actor_id: actorId,
      recipients: {
        create: recipientIds.map((userId) => ({ user_id: userId })),
      },
    },
    include: { recipients: true },
  });
};

// Get notifications for a user
export const getUserNotifications = async (
  userId: string,
  page: number = 1,
  limit: number = 20,
) => {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.notification_Recipient.findMany({
      where: { user_id: userId },
      include: {
        notification: {
          include: {
            actor: { select: { name: true, user_pic: true } },
          },
        },
      },
      orderBy: { notification: { created_at: "desc" } },
      skip,
      take: limit,
    }),
    prisma.notification_Recipient.count({
      where: { user_id: userId },
    }),
  ]);

  return { data, total, page, totalPages: Math.ceil(total / limit) };
};

// Get unread count
export const getUnreadCount = async (userId: string) => {
  return await prisma.notification_Recipient.count({
    where: { user_id: userId, read: false },
  });
};

// Mark notification as read
export const markAsRead = async (recipientId: string) => {
  return await prisma.notification_Recipient.update({
    where: { id: recipientId },
    data: { read: true, read_at: new Date() },
  });
};

// Mark all as read for a user
export const markAllAsRead = async (userId: string) => {
  return await prisma.notification_Recipient.updateMany({
    where: { user_id: userId, read: false },
    data: { read: true, read_at: new Date() },
  });
};

// Get new notifications since a given date (for SSE polling)
export const getNewNotifications = async (
  userId: string,
  since: Date,
) => {
  return await prisma.notification_Recipient.findMany({
    where: {
      user_id: userId,
      notification: { created_at: { gt: since } },
    },
    include: {
      notification: {
        include: {
          actor: { select: { name: true, user_pic: true } },
        },
      },
    },
    orderBy: { notification: { created_at: "desc" } },
  });
};
