import { Organisasi_Type } from "@prisma/client";
import prisma from "@/lib/prisma";
import { findRolesByOrg } from "@/utils/database/orgCustomRole.query";
import { findAllTemplates } from "@/utils/database/permissionTemplate.query";
import { findPeriod } from "@/utils/database/periodYear.query";
import { findOrganisasi } from "@/utils/database/organisasi.query";
import { notFound } from "next/navigation";
import MembersTable from "./_components/MembersTable";
import CustomRoleManager from "./_components/CustomRoleManager";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ organisasi: string; period: string }>;
}) {
  const { organisasi, period } = await params;

  // Find period first, then org via compound key
  const periode = await findPeriod({ period });
  if (!periode) return notFound();

  const org = await findOrganisasi({
    organisasi_period_id: {
      period_id: periode.id,
      organisasi: organisasi.toUpperCase() as Organisasi_Type,
    },
  });

  if (!org) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-500/10 flex items-center justify-center mx-auto">
          <span className="text-3xl">📋</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800">Organisasi Belum Dibuat</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Data organisasi {organisasi.toUpperCase()} untuk periode {period} belum disimpan.
          Silakan simpan informasi organisasi terlebih dahulu.
        </p>
        <a
          href={`/admin/organisasi/${organisasi}/${period}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500/90 to-rose-500/90 text-white rounded-xl hover:from-red-500 hover:to-rose-500 transition-all shadow-sm text-sm font-medium"
        >
          ← Kembali ke Info Organisasi
        </a>
      </div>
    );
  }

  // Fetch all data in parallel
  const [members, customRoles, levels, permissionTemplates, guestUsers] = await Promise.all([
    // Members
    prisma.user.findMany({
      where: { organisasi_id: org.id },
      include: {
        org_role: { include: { level: true } },
        permissions: { where: { organisasi_id: org.id } },
      },
      orderBy: { name: "asc" },
    }),
    // Custom roles
    findRolesByOrg(org.id),
    // Levels
    prisma.org_Level.findMany({
      where: { organisasi_id: org.id },
      orderBy: { order: "asc" },
    }),
    // Permission templates
    findAllTemplates(),
    // Guest users
    prisma.user.findMany({
      where: { organisasi_id: null },
      select: { id: true, name: true, email: true, user_pic: true },
      orderBy: { name: "asc" },
      take: 100,
    }),
  ]);

  // Map members
  const mappedMembers = members.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    user_pic: m.user_pic,
    org_role: m.org_role
      ? {
          id: m.org_role.id,
          name: m.org_role.name,
          is_leader: m.org_role.is_leader,
          hierarchy_level: m.org_role.hierarchy_level,
          level_id: m.org_role.level_id,
          level: m.org_role.level ? { id: m.org_role.level.id, name: m.org_role.level.name, order: m.org_role.level.order } : null,
        }
      : null,
    permissions: m.permissions.map((p) => ({
      id: p.id,
      permission: p.permission,
    })),
  }));

  const mappedRoles = customRoles.map((r) => ({
    id: r.id,
    name: r.name,
    is_leader: r.is_leader,
    hierarchy_level: r.hierarchy_level,
    level_id: (r as { level_id: string | null }).level_id ?? null,
  }));

  const mappedLevels = levels.map((l) => ({
    id: l.id,
    name: l.name,
    order: l.order,
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>{organisasi.toUpperCase()}</span>
        <span>•</span>
        <span>{period}</span>
        <span>•</span>
        <span className="font-medium text-gray-700">Kelola Anggota</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MembersTable
            members={mappedMembers}
            customRoles={mappedRoles}
            organisasiId={org.id}
            permissionTemplates={permissionTemplates}
            guestUsers={guestUsers}
            levels={mappedLevels}
          />
        </div>
        <div>
          <CustomRoleManager
            initialRoles={mappedRoles}
            initialLevels={mappedLevels}
            organisasiId={org.id}
          />
        </div>
      </div>
    </div>
  );
}
