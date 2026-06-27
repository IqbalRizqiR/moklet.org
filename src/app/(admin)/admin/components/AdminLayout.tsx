"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import React from "react";

import Navbar from "./Navbar";
import { Sidebar } from "./Sidebar";
import { BreadcrumbProvider } from "./BreadcrumbContext";
import { BreadcrumbNav } from "./BreadcrumbNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const navRef = React.useRef(false);
  const pathname = usePathname().split("/");

  pathname.shift();

  return (
    <main className="flex w-full h-screen overflow-hidden bg-slate-50">
      <Sidebar nav={navRef.current} session={session} />
      <Navbar session={session} />
      <div
        className={`bg-gray-900 opacity-50 ${navRef.current ? "" : "hidden"} fixed inset-0 z-10`}
        id="sidebarBackdrop"
      />
      <BreadcrumbProvider>
        <div
          id="main-content"
          className="relative min-h-full w-full overflow-y-auto ps-2 lg:ps-24 py-4 lg:ml-64 mt-[90px] lg:mt-0"
        >
          <BreadcrumbNav />
          <main className="pb-16">
            <div className="px-4 pt-4 min-h-fit overflow-y-auto">{children}</div>
          </main>
        </div>
      </BreadcrumbProvider>
    </main>
  );
}
