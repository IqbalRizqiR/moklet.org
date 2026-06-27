import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { findEvent } from "@/utils/database/event.query";
import { auth } from "@/lib/auth";
import { canManageEvent } from "@/utils/permissions";
import EventMembersClientContainer from "./_components/MembersClientContainer";
import { BreadcrumbSetter } from "../../../components/BreadcrumbContext";
import { H2, P } from "@/app/_components/global/Text";

export default async function EventCommittee({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await findEvent({ id });

  if (!event) return notFound();

  const session = await auth();
  if (!session?.user?.id) return redirect("/unauthorized");

  const hasAccess = await canManageEvent(session.user.id, id);
  if (!hasAccess) return redirect("/unauthorized");

  // Fetch all necessary committee infrastructure in parallel
  const [membersRaw, customRoles, levels, guestUsers] = await Promise.all([
    // Members assigned to this event
    prisma.user.findMany({
      where: { event_memberships: { some: { event_id: id } } },
      select: {
        id: true,
        name: true,
        email: true,
        user_pic: true,
        event_memberships: {
          where: { event_id: id },
          include: {
            role: { include: { level: true } }
          }
        }
      }
    }),
    prisma.event_Custom_Role.findMany({ where: { event_id: id }, orderBy: { hierarchy_level: "asc" } }),
    prisma.event_Level.findMany({ where: { event_id: id }, orderBy: { order: "asc" } }),
    
    // Potentially assignable users (who are not currently members of the event)
    prisma.user.findMany({
      where: { event_memberships: { none: { event_id: id } } },
      select: { id: true, name: true, email: true, user_pic: true }
    })
  ]);

  // Map raw prisma users into the shape expected by MembersTable 
  const formattedMembers = membersRaw.map((user: any) => {
    const membership = user.event_memberships[0];
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      user_pic: user.user_pic,
      org_role: membership?.role ? {
        id: membership.role.id,
        name: membership.role.name,
        is_leader: membership.role.is_leader,
        hierarchy_level: membership.role.hierarchy_level,
        level_id: membership.role.level_id,
        level: membership.role.level
      } : null,
      permissions: [] // Not used dynamically in Event
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <BreadcrumbSetter id={id} title={event.event_name} />
      <BreadcrumbSetter id="committee" title="Kelola Panitia" />
      
      <div>
        <H2 className="font-bold">Struktur Kepanitiaan Event</H2>
        <P>Rancang hirarki divisi dan tambahkan staf panitia untuk event {event.event_name}.</P>
      </div>

      <EventMembersClientContainer 
        eventId={id}
        initialLevels={levels}
        initialRoles={customRoles}
        initialMembers={formattedMembers}
        guestUsers={guestUsers}
        permissionTemplates={[]}
      />
    </div>
  );
}
