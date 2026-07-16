import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { H2, P } from "@/app/_components/global/Text";
import { findAccessibleCampaigns } from "@/utils/database/recruitment.query";

export const metadata = {
  title: "Recruitment | Admin Moklet",
};

export default async function AdminRecruitmentOverview() {
  const session = await auth();
  if (!session?.user?.id) redirect("/api/auth/signin");

  const role = session.user.role;
  const campaigns = await findAccessibleCampaigns(session.user.id, role);

  const isSuperView = role === "SuperAdmin" || role === "Admin";

  // Group campaigns by org type
  const grouped = campaigns.reduce((acc: Record<string, typeof campaigns>, c: any) => {
    const key = c.organisasi?.organisasi || c.organisasi_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  const totalActive = campaigns.filter((c: any) => c.is_active).length;
  const totalApplicants = campaigns.reduce((sum: number, c: any) => sum + (c._count?.applicants ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <H2 className="font-semibold">Recruitment Overview</H2>
        <P>
          {isSuperView
            ? "Semua campaign recruitment di seluruh organisasi."
            : "Campaign recruitment untuk organisasi yang Anda kelola."}
        </P>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <p className="text-sm text-gray-500">Total Campaign</p>
          <p className="text-2xl font-bold text-primary-500">{campaigns.length}</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <p className="text-sm text-gray-500">Campaign Aktif</p>
          <p className="text-2xl font-bold text-green-600">{totalActive}</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <p className="text-sm text-gray-500">Total Pendaftar</p>
          <p className="text-2xl font-bold text-blue-600">{totalApplicants}</p>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border text-center text-gray-500">
          Belum ada campaign recruitment yang bisa Anda kelola.
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {Object.entries(grouped).map(([orgType, orgCampaigns]: [string, typeof campaigns]) => (
            <div key={orgType}>
              <h3 className="font-bold text-lg text-gray-700 mb-3 flex items-center gap-2">
                {orgType}
                <span className="text-xs font-normal text-gray-400">({orgCampaigns.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(orgCampaigns as any[]).map((c) => (
                  <Link
                    key={c.id}
                    href={`/admin/organisasi/${orgType.toLowerCase()}/recruitment/${c.id}`}
                  >
                    <div className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition h-full">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold">{c.title}</h4>
                        <span className={`px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap ${c.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                          {c.is_active ? "Aktif" : "Draft"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>Masa Bakti: <span className="font-medium text-gray-700">{c.organisasi.period.period}</span></p>
                        <p>Pendaftar: <span className="font-bold text-black">{c._count.applicants}</span></p>
                        <p>Tahapan: <span className="font-bold text-black">{c._count.steps}</span></p>
                        {c.close_date && (
                          <p>Tutup: {new Date(c.close_date).toLocaleDateString("id-ID", { dateStyle: "medium" })}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
