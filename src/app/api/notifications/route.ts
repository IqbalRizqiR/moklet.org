import { auth } from "@/lib/auth";
import { getUserNotifications, getUnreadCount } from "@/utils/database/notification.query";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");

  const [notifications, unreadCount] = await Promise.all([
    getUserNotifications(session.user.id, page),
    getUnreadCount(session.user.id),
  ]);

  return NextResponse.json({
    ...notifications,
    unreadCount,
  });
}
