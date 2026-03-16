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
          dari {data.user.name}
        </P>
      </div>
      <MdViewer markdown={data.pesan_aspirasi} />
    </div>
  );
}
