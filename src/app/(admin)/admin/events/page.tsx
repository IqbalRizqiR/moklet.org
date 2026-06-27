import LinkButton from "@/app/_components/global/Button";
import { H2, P } from "@/app/_components/global/Text";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { EventWithRelations } from "@/types/entityRelations";

import EventTable from "./_components/Table";
import { isOrgLeader } from "@/utils/permissions";

export default async function EventPanel() {
  const session = await auth();

  // If Admin or SuperAdmin, see all events. 
  // Otherwise, only see events where user is leader of the org OR member of the event
  let events = [];
  
  if (session?.user?.role === "Admin" || session?.user?.role === "SuperAdmin") {
    events = await prisma.event.findMany({
      include: {
        organisasi: true,
        user: { select: { name: true, user_pic: true, role: true } }
      },
      orderBy: { created_at: "desc" }
    });
  } else if (session?.user?.id) {
    const userId = session.user.id;
    
    // Find all orgs where user is leader
    const ledOrgs = await prisma.org_Member.findMany({
      where: { user_id: userId, role: { is_leader: true } },
      select: { organisasi_id: true }
    });
    const ledOrgIds = ledOrgs.map((o: any) => o.organisasi_id);

    events = await prisma.event.findMany({
      where: {
        OR: [
          { organisasi_id: { in: ledOrgIds } },
          { members: { some: { user_id: userId } } }
        ]
      },
      include: {
        organisasi: true,
        user: { select: { name: true, user_pic: true, role: true } }
      },
      orderBy: { created_at: "desc" }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-5">
        <div>
          <H2 className="font-semibold">Event Panel</H2>
          <P>Manage school events, assign committees, and oversee logistics.</P>
        </div>
        <div>
          <LinkButton variant={"primary"} href="/admin/events/create">
            <div className="flex items-center w-full">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 12H18"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 18V6"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Create Event
            </div>
          </LinkButton>
        </div>
      </div>
      <div>
        <EventTable data={events as EventWithRelations[]} />
      </div>
    </div>
  );
}
