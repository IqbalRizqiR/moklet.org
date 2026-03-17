import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    
    // Simple protection so random visitors don't hit this route on production
    if (secret !== "migrate123") {
      return NextResponse.json({ error: "Unauthorized. Please provide the correct secret query parameter." }, { status: 401 });
    }

    // Find all users with their auth and organization data
    const users = await prisma.user.findMany({
      include: {
        userAuth: true,
        organisasi: true,
      }
    });

    let authCreatedCount = 0;
    let rolesUpdatedCount = 0;

    for (const user of users) {
      // 1. Create User_Auth record if missing
      if (!user.userAuth) {
        await prisma.user_Auth.create({
          data: {
            userEmail: user.email,
          }
        });
        authCreatedCount++;
      }

      // 2. Sync system role with organization name if they belong to one
      if (user.organisasi && user.organisasi.organisasi) {
        const expectedRole = user.organisasi.organisasi as any;
        if (user.role !== expectedRole) {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: expectedRole }
          });
          rolesUpdatedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Data migration completed successfully!",
      stats: {
        totalUsersChecked: users.length,
        userAuthEntriesCreated: authCreatedCount,
        systemRolesUpdated: rolesUpdatedCount,
      }
    });

  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Migration failed", details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
}
