import { H2, P } from "@/app/_components/global/Text";
import { auth } from "@/lib/auth";

export default async function Admin() {
  const session = await auth();
  const { user } = session!;
  const name = user?.name.replace(/ .*/, "");

  return (
    <>
      <H2 className="font-semibold ">Halo, Bro {name}👋</H2>
      <P>Here’s whats going on today</P>
    </>
  );
}
