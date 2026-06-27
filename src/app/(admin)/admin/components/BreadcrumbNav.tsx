"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBreadcrumb } from "./BreadcrumbContext";

export function BreadcrumbNav() {
  const { titles } = useBreadcrumb();
  const pathname = usePathname().split("/");
  pathname.shift(); // Remove empty string before first slash

  return (
    <nav className="w-full overflow-x-clip rounded-lg align-middle p-2 font-sans text-lg lg:text-xl capitalize md:p-3">
      <ul className="flex flex-wrap items-center">
        <li>
          <Link href="/" className="font-semibold">
            home
          </Link>
        </li>
        {pathname.map((path, i) => {
          const href = "/" + pathname.slice(0, i + 1).join("/");
          // Use the globally registered title if available, otherwise fallback to path segment
          const displayTitle = titles[path] || path;
          
          return (
            <React.Fragment key={i}>
              <li className="px-3">
                <svg
                  width="30"
                  height="31"
                  viewBox="0 0 30 31"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.1377 25.4L19.2877 17.25C20.2502 16.2875 20.2502 14.7125 19.2877 13.75L11.1377 5.59998"
                    stroke="#E04E4E"
                    strokeWidth="1.2"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </li>
              <li>
                <Link className="font-semibold" href={href}>
                  {displayTitle}
                </Link>
              </li>
            </React.Fragment>
          );
        })}
      </ul>
    </nav>
  );
}
