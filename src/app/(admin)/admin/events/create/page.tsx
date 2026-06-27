import { auth } from "@/lib/auth";
import { findUser } from "@/utils/database/user.query";

import prisma from "@/lib/prisma";
import EventForm from "./_components/Form";
import { H2 } from "@/app/_components/global/Text";

export default async function CreateEvent() {
  const session = await auth();
  const user = await findUser({ id: session?.user?.id });
  const isAdmin = session?.user?.role === "SuperAdmin" || session?.user?.role === "Admin";
  
  let organizations: any[] = [];
  
  if (isAdmin) {
    const allOrgs = await prisma.organisasi.findMany({ 
      include: { period: true },
      orderBy: { period: { period: "desc" } }
    });
    
    const uniqueOrgs = new Map();
    for(const org of allOrgs) {
      if(!uniqueOrgs.has(org.organisasi_name)) {
        uniqueOrgs.set(org.organisasi_name, org);
      }
    }
    
    organizations = Array.from(uniqueOrgs.values()).map((org: any) => ({
      organisasi_id: org.id,
      organisasi: { organisasi_name: org.organisasi_name }
    }));
  } else {
    const arrayMemberships: any[] = user?.memberships ?? [];
    const ledMembershipIds = arrayMemberships.filter(m => m.role?.is_leader).map(m => m.organisasi_id);
    
    if (ledMembershipIds.length > 0) {
      const ledOrgs = await prisma.organisasi.findMany({
        where: { id: { in: ledMembershipIds } },
        include: { period: true },
        orderBy: { period: { period: "desc" } }
      });
      
      const uniqueOrgs = new Map();
      for(const org of ledOrgs) {
        if(!uniqueOrgs.has(org.organisasi_name)) {
          uniqueOrgs.set(org.organisasi_name, org);
        }
      }
      
      organizations = Array.from(uniqueOrgs.values()).map((org: any) => ({
        organisasi_id: org.id,
        organisasi: { organisasi_name: org.organisasi_name }
      }));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <H2>Buat Event Baru</H2>
      <EventForm organizations={organizations} isAdmin={isAdmin} />
    </div>
  );
}
