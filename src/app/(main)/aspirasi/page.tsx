import { findAllEvents } from "@/utils/database/event.query";
import AspirationWrapper from "./_components/Wrapper";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Aspirasi() {
  const events = await findAllEvents();
  const session = await auth();

  if (!session?.user)
    return redirect("/api/auth/signin?callbackUrl=%2Faspirasi");

  return <AspirationWrapper events={events} />;
}
