import prisma from "@/lib/prisma";
import { SectionWrapper } from "@/app/_components/global/Wrapper";
import { H2 } from "@/app/_components/global/Text";

const LEVEL_CONFIG: Record<number, { label: string; bgClass: string; dotClass: string }> = {
  0: { label: "Pembina", bgClass: "from-amber-500/20 to-yellow-500/10", dotClass: "bg-amber-400" },
  1: { label: "Ketua", bgClass: "from-rose-500/20 to-red-500/10", dotClass: "bg-rose-500" },
  2: { label: "Wakil Ketua", bgClass: "from-pink-500/20 to-rose-400/10", dotClass: "bg-pink-400" },
  3: { label: "Inti", bgClass: "from-blue-500/20 to-indigo-500/10", dotClass: "bg-blue-500" },
  4: { label: "Koordinator", bgClass: "from-emerald-500/20 to-teal-500/10", dotClass: "bg-emerald-500" },
  5: { label: "Anggota", bgClass: "from-slate-400/15 to-gray-400/5", dotClass: "bg-slate-400" },
};

function getConfig(level: number) {
  return LEVEL_CONFIG[Math.min(level, 5)] ?? LEVEL_CONFIG[5];
}

export default async function OrgStructureChart({
  organisasiId,
}: {
  organisasiId: string;
}) {
  const [levels, members] = await Promise.all([
    prisma.org_Level.findMany({
      where: { organisasi_id: organisasiId },
      orderBy: { order: "asc" },
    }),
    prisma.user.findMany({
      where: {
        memberships: {
          some: { organisasi_id: organisasiId }
        }
      },
      select: {
        id: true,
        name: true,
        user_pic: true,
        memberships: {
          where: { organisasi_id: organisasiId },
          include: {
            role: {
              include: { level: true }
            }
          }
        }
      },
      orderBy: { name: "asc" },
    }),
  ]);

  if (members.length === 0) {
    return null;
  }

  // Group members by level
  // If we have custom levels defined, use them. Otherwise fallback to hierarchy_level.
  const hasCustomLevels = levels.length > 0;
  
  const grouped: { label: string; order: number; members: typeof members }[] = [];
  const groupMap = new Map<string, number>();

  if (hasCustomLevels) {
    // Initialize groups for all defined levels to maintain order even if empty
    levels.forEach((lvl: any, idx: any) => {
      grouped.push({ label: lvl.name, order: lvl.order, members: [] });
      groupMap.set(lvl.id, idx);
    });

    // Add members to their level groups
    members.forEach((m: any) => {
      const orgRole = m.memberships[0]?.role;
      const levelId = orgRole?.level?.id;
      if (levelId && groupMap.has(levelId)) {
        grouped[groupMap.get(levelId)!].members.push(m);
      } else {
        // Fallback for members whose role doesn't have a level_id but org has levels
        // We might want to put them in the lowest level or a special group
        // For now, let's skip them or add a "Lainnya" group if needed
      }
    });
  } else {
    // Fallback to old hierarchy_level logic
    const fallbackGrouped: Record<number, typeof members> = {};
    for (const m of members) {
      const orgRole = (m as any).memberships[0]?.role;
      const level = orgRole?.hierarchy_level ?? 5;
      if (!fallbackGrouped[level]) fallbackGrouped[level] = [];
      fallbackGrouped[level].push(m);
    }

    Object.keys(fallbackGrouped).forEach((level) => {
      const lvlNum = parseInt(level);
      const config = LEVEL_CONFIG[Math.min(lvlNum, 5)] ?? LEVEL_CONFIG[5];
      grouped.push({
        label: config.label,
        order: lvlNum,
        members: fallbackGrouped[lvlNum],
      });
    });
    grouped.sort((a, b) => a.order - b.order);
  }

  return (
    <SectionWrapper id="struktur">
      <div className="flex flex-col gap-6 w-full">
        <H2 className="font-bold text-center">Struktur Organisasi</H2>

        <div className="relative flex flex-col items-center gap-0">
          {grouped.filter(g => g.members.length > 0).map((group, levelIdx) => {
            const config = getConfig(group.order);

            return (
              <div key={group.label} className="w-full flex flex-col items-center">
                {levelIdx > 0 && (
                  <div className="w-px h-6 bg-gradient-to-b from-gray-300/60 to-gray-200/30" />
                )}

                <div className="mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase px-3.5 py-1 rounded-full backdrop-blur-md bg-gradient-to-r ${config.bgClass} border border-white/20 text-gray-700 shadow-sm`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
                    {group.label}
                  </span>
                </div>

                <div className="flex flex-wrap justify-center gap-3 max-w-5xl px-2">
                  {group.members.map((member: any) => (
                    <div
                      key={member.id}
                      className="group relative flex flex-col items-center gap-2.5 px-4 py-4 rounded-2xl backdrop-blur-lg bg-white/60 border border-white/40 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 w-[130px]"
                    >
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-red-200/40 to-rose-300/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={member.user_pic}
                        alt={member.name}
                        className="relative w-14 h-14 rounded-full object-cover ring-2 ring-white/70 shadow-sm group-hover:ring-red-200/60 transition-all duration-300"
                      />
                      <div className="text-center min-w-0 w-full">
                        <p className="text-[13px] font-semibold text-gray-800 truncate leading-tight">
                          {member.name}
                        </p>
                        <p className="text-[11px] text-gray-400/90 truncate mt-0.5">
                          {(member as any).memberships[0]?.role?.name ?? "Anggota"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}

