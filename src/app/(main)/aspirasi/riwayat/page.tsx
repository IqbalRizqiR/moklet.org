import { getUserAspirations } from "@/actions/aspirasi";
import { SectionWrapper } from "@/app/_components/global/Wrapper";
import { H2, P } from "@/app/_components/global/Text";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import EditAspirationModal from "./_components/EditAspirationModal";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export default async function RiwayatAspirasi() {
  const { data: aspirations, success } = await getUserAspirations();

  return (
    <SectionWrapper id="riwayat-aspirasi" className="min-h-screen py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/aspirasi" className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <FiArrowLeft className="w-6 h-6 text-neutral-600" />
          </Link>
          <div>
            <H2 className="text-3xl font-black text-neutral-800">Riwayat Aspirasi Anda</H2>
            <P className="text-neutral-500 font-medium mt-1">
              Lihat dan kelola aspirasi yang pernah Anda sampaikan sebelumnya.
            </P>
          </div>
        </div>

        {!success || !aspirations || aspirations.length === 0 ? (
          <div className="text-center py-20 bg-white border border-neutral-100 rounded-3xl shadow-sm">
            <p className="text-neutral-500 font-medium">Belum ada aspirasi yang pernah Anda kirimkan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {aspirations.map((aspiration: any) => (
              <div 
                key={aspiration.id} 
                className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-xl text-neutral-800">{aspiration.judul_aspirasi}</h3>
                    <div className="flex items-center gap-2 mt-2 text-xs font-semibold">
                      <span className="px-2.5 py-1 rounded-full bg-primary-50 text-primary-600">
                        {aspiration.organisasi || aspiration.unit_sekolah || aspiration.event?.event_name || 'Umum'}
                      </span>
                      <span className="text-neutral-400">
                        {format(new Date(aspiration.created_at), "dd MMM yyyy, HH:mm", { locale: id })}
                      </span>
                      {aspiration.is_anonymous && (
                        <span className="px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-500">
                          Anonim
                        </span>
                      )}
                    </div>
                  </div>
                  <EditAspirationModal aspiration={aspiration} />
                </div>
                
                <div 
                  className="prose prose-sm max-w-none text-neutral-600 line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: aspiration.pesan_aspirasi }}
                />

                {aspiration.gambar_aspirasi && (
                  <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center gap-2 text-xs font-semibold text-neutral-500">
                    <span className="w-1 h-1 rounded-full bg-primary-400" />
                    Terdapat lampiran gambar
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
