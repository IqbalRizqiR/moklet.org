"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/app/_components/global/Button";
import cn from "@/lib/clsx";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string | null;
  links?: Array<{ label: string; url: string }> | null;
}

export default function SuccessModal({
  isOpen,
  onClose,
  message,
  links,
}: SuccessModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        className={cn(
          "relative w-full max-w-md rounded-xl bg-white p-8 shadow-xl transition-all duration-300",
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {message && (
            <p className="mb-6 text-base text-neutral-700">{message}</p>
          )}

          {links && links.length > 0 && (
            <div className="mb-6 flex w-full flex-col gap-3">
              {links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-primary-300 bg-white px-6 py-3 text-base text-primary-500 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50"
                >
                  {link.label}
                  <svg
                    className="ml-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              ))}
            </div>
          )}

          <Button variant="primary" onClick={onClose}>
            Lihat Status Pendaftaran
          </Button>
        </div>
      </div>
    </div>
  );
}
