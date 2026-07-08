"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import CountdownTimer from "@/app/_components/global/CountdownTimer";

export interface BannerSlide {
  id: string;
  kind: "recruitment" | "event";
  title: string;
  description: string | null;
  orgName: string;
  orgLogo: string | null;
  href: string;
  ctaLabel: string;
  closeDate: string | null;
}

export default function EventBannerCarousel({ slides }: { slides: BannerSlide[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center" },
    [Autoplay({ delay: 5500, stopOnInteraction: false })],
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi],
  );
  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  if (slides.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 md:px-6 pt-6 pb-4">
      <div className="relative">
        <div className="overflow-hidden rounded-3xl" ref={emblaRef}>
          <div className="flex">
            {slides.map((slide) => (
              <div key={slide.id} className="relative min-w-0 flex-[0_0_100%]">
                <div className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-8 md:p-12">
                  {/* decorative blobs */}
                  <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white opacity-10 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white opacity-10 blur-3xl" />

                  <div className="relative z-10 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="max-w-2xl text-white">
                      <div className="mb-4 flex items-center gap-3">
                        {slide.orgLogo && (
                          <img
                            src={slide.orgLogo}
                            alt={slide.orgName}
                            className="h-10 w-10 rounded-full border-2 border-white/40 bg-white/90 object-contain p-0.5"
                          />
                        )}
                        <span className="rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                          {slide.kind === "recruitment" ? "Open Recruitment" : "Event"} · {slide.orgName}
                        </span>
                      </div>

                      <h2 className="text-2xl font-extrabold tracking-tight md:text-4xl">
                        {slide.title}
                      </h2>

                      {slide.description && (
                        <p className="mt-3 line-clamp-2 text-primary-50 md:text-lg">
                          {slide.description}
                        </p>
                      )}

                      {slide.closeDate && (
                        <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
                          <span className="text-xs font-medium uppercase tracking-wide text-white/80">
                            Ditutup dalam
                          </span>
                          <span className="text-white">
                            <CountdownTimer targetDate={slide.closeDate} compact onExpire="hide" />
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="w-full shrink-0 md:w-auto">
                      <Link href={slide.href}>
                        <span className="block w-full rounded-xl bg-white px-8 py-3.5 text-center text-base font-bold text-primary-600 shadow-lg transition-transform hover:scale-105 md:w-auto">
                          {slide.ctaLabel}
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* arrows */}
        {slides.length > 1 && (
          <>
            <button
              aria-label="Sebelumnya"
              onClick={scrollPrev}
              className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/40 md:block"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              aria-label="Berikutnya"
              onClick={scrollNext}
              className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/40 md:block"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}

        {/* dots */}
        {slides.length > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                aria-label={`Slide ${index + 1}`}
                onClick={() => scrollTo(index)}
                className={`h-2 rounded-full transition-all ${
                  index === selectedIndex ? "w-6 bg-primary-500" : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
