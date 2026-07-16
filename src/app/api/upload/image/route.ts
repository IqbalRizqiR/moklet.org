import { NextRequest } from "next/server";

import { uploadImageCloudinary, uploadImageImbb } from "@/actions/fileUploader";
import { auth } from "@/lib/auth";
import {
  badRequest,
  created,
  internalServerError,
  unauthorized,
} from "@/utils/apiResponse";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.email) return unauthorized();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const hostType = formData.get("hostType") as "CLOUDINARY" | "IMGBB";

    if (!file) {
      return badRequest([
        {
          message: "file is required",
        },
      ]);
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return badRequest([{ message: "File terlalu besar (maksimal 5MB)" }]);
    }
    if (!file.type.startsWith("image/")) {
      return badRequest([{ message: "Hanya file gambar yang diizinkan" }]);
    }

    if (session.user.role === "Guest") return unauthorized();

    const fileArrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(new Uint8Array(fileArrayBuffer));

    const uploader =
      hostType === "CLOUDINARY"
        ? await uploadImageCloudinary(fileBuffer)
        : await uploadImageImbb(fileBuffer);

    if (!uploader || uploader.error) {
      if (uploader.message.includes("not allowed") || uploader.message.includes("limit"))
        return badRequest([{ message: uploader.message }], uploader.message);

      return internalServerError([], uploader.message || "Gagal mengupload gambar");
    }
    return created(uploader.data, uploader.message);
  } catch (error) {
    return internalServerError([]);
  }
}
