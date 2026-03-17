import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUnitSekolahConfigs } from "@/actions/unitSekolahConfig";
import UnitSchoolSettings from "./_components/UnitSchoolSettings";
import { FaBullhorn } from "react-icons/fa";

export default async function AspirasiSettingsPage() {
  const session = await auth();
  
  if (session?.user?.role !== "SuperAdmin") {
    redirect("/admin");
  }

  const configs = await getUnitSekolahConfigs();

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-200">
            <FaBullhorn size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-800 tracking-tight">Pengaturan Aspirasi</h1>
            <p className="text-neutral-400 text-sm">Kelola nomor WhatsApp notifikasi untuk setiap unit sekolah.</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-primary-500/5 blur-3xl -z-10 rounded-full" />
        <UnitSchoolSettings initialConfigs={JSON.parse(JSON.stringify(configs))} />
      </div>
    </div>
  );
}
