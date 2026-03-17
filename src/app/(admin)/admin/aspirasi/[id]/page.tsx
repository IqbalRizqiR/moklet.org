import { findAspiration } from "@/utils/database/aspiration.query";
import { notFound } from "next/navigation";
import MdViewer from "@/app/(main)/berita/[slug]/_components/MdViewer";
import { H3, P } from "@/app/_components/global/Text";

export default async function AspirationDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await findAspiration({ id });

  if (!data) return notFound();

  return (
    <div>
      <div className="mb-10">
        <H3>{data.judul_aspirasi}</H3>
        <P>
          untuk {data.unit_sekolah || data.organisasi || data.event?.event_name}{" "}
          dari {data.is_anonymous ? "Anonim" : data.user.name}
        </P>
      </div>

      {data.gambar_aspirasi && (
        <div className="mb-8 rounded-2xl overflow-hidden shadow-md border border-gray-100 max-w-2xl bg-white p-2">
          <img 
            src={data.gambar_aspirasi} 
            alt="Lampiran Aspirasi" 
            className="w-full h-auto rounded-xl object-contain"
          />
          <div className="px-2 py-2">
            <p className="text-[10px] text-gray-400 font-medium italic">LAMPIRAN GAMBAR</p>
          </div>
        </div>
      )}

      <MdViewer markdown={data.pesan_aspirasi} />
    </div>
  );
}
