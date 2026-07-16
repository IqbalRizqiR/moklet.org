import Link from "next/link";
import { H2, P } from "@/app/_components/global/Text";
import { auth } from "@/lib/auth";
import { findAccessibleCampaigns } from "@/utils/database/recruitment.query";

export default async function Admin() {
  const session = await auth();
  const { user } = session!;
  const name = user?.name.replace(/ .*/, "");

  const campaigns = user?.id
    ? await findAccessibleCampaigns(user.id, user.role)
    : [];
  const activeCampaigns = (campaigns as any[]).filter((c) => c.is_active).length;
  const totalApplicants = (campaigns as any[]).reduce((sum: number, c: any) => sum + (c._count?.applicants ?? 0), 0);

  return (
    <>
      <H2 className="font-semibold ">Halo, Bro {name}👋</H2>
      <P>Here's whats going on today</P>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin/recruitment" className="block">
          <div className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800">Recruitment</h3>
              <span className="text-primary-500 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">Kelola open recruitment organisasi.</p>
            <div className="flex gap-6">
              <div>
                <p className="text-2xl font-bold text-green-600">{activeCampaigns}</p>
                <p className="text-xs text-gray-400">Aktif</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{totalApplicants}</p>
                <p className="text-xs text-gray-400">Pendaftar</p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}
