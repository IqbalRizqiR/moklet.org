import { notFound, redirect } from "next/navigation";
import { findEvent } from "@/utils/database/event.query";
import { auth } from "@/lib/auth";
import { canManageEvent } from "@/utils/permissions";
import { H2, P } from "@/app/_components/global/Text";
import LinkButton from "@/app/_components/global/Button";
import { BreadcrumbSetter } from "../../components/BreadcrumbContext";

export default async function EventDetail({
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

  return (
    <div className="flex flex-col gap-6">
      <BreadcrumbSetter id={id} title={event.event_name} />
      
      <div className="flex items-center justify-between">
        <div>
          <H2 className="font-bold">{event.event_name}</H2>
          <P>Status: {event.status} | {event.start_date?.toDateString()} - {event.end_date?.toDateString()}</P>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col gap-4">
          <h3 className="font-semibold text-lg">Struktur Kepanitiaan</h3>
          <p className="text-gray-500 text-sm">Kelola peran, level, dan anggota panitia di event ini.</p>
          <LinkButton href={`/admin/events/${id}/committee`} variant="primary">
            Kelola Panitia
          </LinkButton>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col gap-4 opacity-50 cursor-not-allowed">
          <h3 className="font-semibold text-lg">Rundown (Tahap 2)</h3>
          <p className="text-gray-500 text-sm">Kelola susunan acara dan timeline kegiatan harian.</p>
          <button disabled className="bg-gray-300 text-white py-2 rounded-lg font-semibold">
            Segera Hadir
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col gap-4 opacity-50 cursor-not-allowed">
          <h3 className="font-semibold text-lg">Tasks & Kanban (Tahap 2)</h3>
          <p className="text-gray-500 text-sm">Lacak tugas panitia dengan papan kanban interaktif.</p>
          <button disabled className="bg-gray-300 text-white py-2 rounded-lg font-semibold">
            Segera Hadir
          </button>
        </div>
      </div>
    </div>
  );
}
