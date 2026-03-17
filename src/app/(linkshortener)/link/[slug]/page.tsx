import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { SectionWrapper } from "@/app/_components/global/Wrapper";
import prisma from "@/lib/prisma";

import PasswordPrompt from "./_components/PasswordPrompt";

export default async function RedirectToTarget({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const findShortLink = await prisma.link_Shortener.findUnique({
    where: { slug },
  });
  const headersList = await headers();
  const host = headersList.get("host");
  const proto = headersList.get("x-forwarded-proto");

  if (!findShortLink) return notFound();
  if (findShortLink.password) {
    return (
      <SectionWrapper id="pass">
        <PasswordPrompt slug={slug} />
      </SectionWrapper>
    );
  }

  // Increments the click count of the short link
  await prisma.link_Shortener_Count.upsert({
    where: { id: slug },
    update: { click_count: { increment: 1 } },
    create: { click_count: 1, id: slug },
  });

  return redirect(
    (findShortLink.type == "System" ? proto + "://" + host : "") +
      findShortLink.target_url,
  );
}
