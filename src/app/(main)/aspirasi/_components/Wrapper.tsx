"use client";

import { aspirationType } from "@/actions/aspirasi";
import { useState } from "react";
import AspirationForm from "./AspirationForm";
import Selector from "./Selector";
import { Event } from "@prisma/client";
import Link from "next/link";

export default function AspirationWrapper({ events }: { events: Event[] }) {
  const [type, setType] = useState<aspirationType | undefined>();

  const [recipient, setRecipient] = useState<string | undefined>();
  const [eventName, setEventName] = useState<string | undefined>();

  return (
    <div className="relative">
      <div className="max-w-7xl mx-auto px-4 pt-10 flex justify-end">
        <Link 
          href="/aspirasi/riwayat"
          className="px-4 py-2 text-sm font-bold text-primary-600 bg-primary-50 rounded-full hover:bg-primary-100 transition-colors shadow-sm"
        >
          Lihat Riwayat Aspirasi
        </Link>
      </div>
      
      <Selector
        recipient={recipient?.toString()}
        setRecipient={setRecipient}
        setEventName={setEventName}
        setType={setType}
        type={type}
        event={events}
      />
      <AspirationForm
        recipient={recipient!}
        type={type!}
        eventName={eventName!}
      />
    </div>
  );
}
