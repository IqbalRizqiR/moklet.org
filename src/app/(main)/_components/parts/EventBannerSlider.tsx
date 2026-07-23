import React from "react";
import prisma from "@/lib/prisma";
import EventBannerCarousel, { BannerSlide } from "./EventBannerCarousel";

export default async function EventBannerSlider() {
  const now = new Date();

  const [campaigns, events] = await Promise.all([
    prisma.recruitment_Campaign.findMany({
      where: {
        is_active: true,
        close_date: { gt: now },
      },
      include: { organisasi: true },
      orderBy: { close_date: "asc" },
    }),
    prisma.event.findMany({
      where: { status: "ACTIVE" },
      include: { organisasi: true },
      orderBy: { start_date: "asc" },
    }),
  ]);

  const campaignSlides: BannerSlide[] = campaigns
    .filter((c) => c.open_date <= now)
    .map((c) => ({
      id: `campaign-${c.id}`,
      kind: "recruitment" as const,
      title: c.title,
      description: c.description,
      orgName: c.organisasi.organisasi_name || c.organisasi.organisasi,
      orgLogo: c.organisasi.logo || null,
      href: "/recruitment",
      ctaLabel: "Daftar Sekarang",
      closeDate: c.close_date.toISOString(),
    }));

  const eventSlides: BannerSlide[] = events.map((e: typeof events[number]) => ({
    id: `event-${e.id}`,
    kind: "event" as const,
    title: e.event_name,
    description: e.description,
    orgName: e.organisasi?.organisasi_name || e.organisasi?.organisasi || "Moklet",
    orgLogo: e.organisasi?.logo || null,
    href: "/organisasi",
    ctaLabel: "Lihat Detail",
    closeDate: e.end_date ? e.end_date.toISOString() : null,
  }));

  const slides = [...campaignSlides, ...eventSlides];

  if (slides.length === 0) return null;

  return <EventBannerCarousel slides={slides} />;
}
