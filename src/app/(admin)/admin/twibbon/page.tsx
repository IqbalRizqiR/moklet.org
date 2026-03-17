import { H2, P } from "@/app/_components/global/Text";

import { auth } from "@/lib/auth";
import { findAllTwibbon } from "@/utils/database/twibbon.query";
import AddTwibbon from "./_components/AddPeriod";
import TwibbonTable from "./_components/Table";

export default async function PeriodPage() {
  const session = await auth();
  const { user } = session!;

  const twibbons = await findAllTwibbon({
    user_id: user?.role == "SuperAdmin" ? undefined : user?.id,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <H2 className="font-semibold">Twibbon</H2>
          <P>Create a watermark-free twibbon for your event</P>
        </div>
        <AddTwibbon />
      </div>
      <TwibbonTable data={twibbons} />
    </div>
  );
}
