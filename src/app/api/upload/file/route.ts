import { NextRequest } from "next/server";

import { uploadImageCloudinary } from "@/actions/fileUploader";
import { auth } from "@/lib/auth";
import {
  badRequest,
  created,
  internalServerError,
  unauthorized,
} from "@/utils/apiResponse";

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// 10MB — larger than the image-only route to accommodate CVs/documents
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.email) return unauthorized();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return badRequest([{ message: "file is required" }]);
    }

    if (file.size > MAX_SIZE) {
      return badRequest([{ message: "File terlalu besar (maksimal 10MB)" }]);
    }

    const isImage = file.type.startsWith("image/");
    if (!ALLOWED_TYPES.includes(file.type)) {
      return badRequest([
        { message: "Hanya file gambar, PDF, atau dokumen Word yang diizinkan" },
      ]);
    }

    if (session.user.role === "Guest") return unauthorized();

    const fileArrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(new Uint8Array(fileArrayBuffer));

    const uploader = await uploadImageCloudinary(fileBuffer, "recruitment_files");

    if (!uploader || uploader.error) {
      return internalServerError([], uploader.message || "Gagal mengupload file");
    }

    return created(
      { ...uploader.data, name: file.name, isImage },
      uploader.message,
    );
  } catch (error) {
    return internalServerError([]);
  }
}
