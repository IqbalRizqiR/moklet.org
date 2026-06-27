/* eslint-disable */
"use client";

import { fileSizeToMb } from "@/utils/atomics";
import MDEditor, {
  commands,
  bold,
  italic,
  strikethrough,
  title,
  divider,
  link,
  quote,
  code,
  hr,
  codeBlock,
  comment,
  table,
  unorderedListCommand,
  orderedListCommand,
  checkedListCommand,
  TextAreaTextApi,
} from "@uiw/react-md-editor";
import { ChangeEvent, useRef } from "react";
import { FaFileImage } from "react-icons/fa";
import { toast } from "sonner";

export default function Editor({
  value,
  onChange,
  label,
  hostType = "CLOUDINARY",
}: {
  value: string;
  onChange: (
    value?: string | undefined,
    event?: ChangeEvent<HTMLTextAreaElement> | undefined,
  ) => void;
  label?: string;
  hostType?: "CLOUDINARY" | "IMGBB";
}) {
  const insertImageRef = useRef<HTMLInputElement>(null);

  const insertImage: commands.ICommand = {
    name: "Insert image",
    keyCommand: "Insert upload",
    buttonProps: { "aria-label": "Insert an image" },
    icon: <FaFileImage />,
    execute: async (_, api: TextAreaTextApi) => {
      if (insertImageRef.current) {
        const result = await getImage();
        if (!result) return toast.error("Failed to load image");

        const imageSizeInMb = fileSizeToMb(result.size);
        if (imageSizeInMb > 10)
          return toast.error(
            "Ukuran file terlalu besar! Ukuran maximum 10 MB",
          );

        const data = new FormData();

        data.append("file", result!);
        data.append("hostType", hostType);
        const toastId = toast.loading("Uploading image...");
        const response = await fetch("/api/upload/image", {
          method: "POST",
          body: data,
        });

        const upload = await response.json();

        if (response.status != 201) {
          toast.error(upload.message || "Gagal mengupload gambar", {
            id: toastId,
          });
        } else {
          const modifyText = `![user image](${upload.data?.url})\n`;
          api.replaceSelection(modifyText);
          toast.success("Sukses upload gambar", { id: toastId });
        }
        insertImageRef!.current!.value = "";
      }
    },
  };

  function getImage(): Promise<File | null | undefined> {
    return new Promise((resolve, reject) => {
      if (insertImageRef.current) {
        insertImageRef.current.onchange = () => {
          try {
            if (!confirm("Upload this image?")) {
              insertImageRef!.current!.value = "";
              return;
            }
            resolve(insertImageRef.current?.files?.[0]!);
          } catch (e) {
            reject(e);
          }
        };
        insertImageRef.current?.click();
      }
    });
  }

  const commands = [
    bold,
    italic,
    strikethrough,
    hr,
    title,
    divider,
    link,
    quote,
    code,
    codeBlock,
    comment,
    insertImage,
    table,
    divider,
    unorderedListCommand,
    orderedListCommand,
    checkedListCommand,
  ];

  return (
    <div data-color-mode="light">
      <label htmlFor="textEditor">{label ?? "Text Editor"}</label>
      <input
        type="file"
        hidden
        name="insertImage"
        ref={insertImageRef}
        accept="image/gif,image/jpeg,image/jpg,image/png,image/webp,image/svg"
      />
      <MDEditor
        value={value}
        onChange={onChange}
        className="[&>div.w-md-editor-content>div.w-md-editor-preview]:prose"
        height={600}
        style={{
          backgroundColor: "#fff",
          color: "#000",
          fontFamily: "inherit",
          padding: 0,
        }}
        id="textEditor"
        commands={commands}
      />
    </div>
  );
}
