"use client";

import dynamic from "next/dynamic";
import { ChangeEvent } from "react";

const MdEditorInner = dynamic(
  () => import("./MdEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse space-y-2">
        <div className="h-5 w-24 bg-gray-200 rounded" />
        <div className="h-[600px] bg-gray-100 rounded-lg border border-gray-200" />
      </div>
    ),
  },
);

export default function LazyEditor(props: {
  value: string;
  onChange: (
    value?: string | undefined,
    event?: ChangeEvent<HTMLTextAreaElement> | undefined,
  ) => void;
  label?: string;
  hostType?: "CLOUDINARY" | "IMGBB";
}) {
  return <MdEditorInner {...props} />;
}
