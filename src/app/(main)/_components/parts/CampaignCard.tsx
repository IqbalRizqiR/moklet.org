import LinkButton from "@/app/_components/global/Button";
import CountdownTimer from "@/app/_components/global/CountdownTimer";
import Link from "next/link";

export default function CampaignCard({
  id,
  title,
  orgName,
  orgLogo,
  closeDate,
}: {
  id: string;
  title: string;
  orgName: string;
  orgLogo: string | null;
  closeDate: string;
}) {
  return (
    <div className="group relative flex flex-col rounded-xl border border-neutral-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="h-1 w-full rounded-t-xl bg-gradient-to-r from-primary-500 to-primary-400" />

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-start gap-3">
          {orgLogo && (
            <img
              src={orgLogo}
              alt={orgName}
              className="h-12 w-12 shrink-0 rounded-lg object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <Link href={`/recruitment/${id}`}>
              <h3 className="text-lg font-bold leading-tight text-black transition-colors group-hover:text-primary-500">
                {title}
              </h3>
            </Link>
            <p className="mt-0.5 text-sm text-neutral-500">{orgName}</p>
          </div>
        </div>

        <div className="mb-5 flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2.5">
          <svg
            className="h-4 w-4 shrink-0 text-primary-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-xs font-semibold text-primary-600">
            Tersisa
          </span>
          <span className="ml-auto text-sm font-semibold text-primary-700">
            <CountdownTimer targetDate={closeDate} compact onExpire="hide" />
          </span>
        </div>

        <LinkButton
          href={`/recruitment/${id}`}
          variant="primary"
          className="mt-auto w-full text-sm"
        >
          Daftar Sekarang
        </LinkButton>
      </div>
    </div>
  );
}
