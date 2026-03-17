"use server";

import { UploadApiResponse } from "cloudinary";

import cloudinary from "@/lib/cloudinary";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function uploadImageCloudinary(file: Buffer | any) {
  try {
    const upload: UploadApiResponse | undefined = await new Promise(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || "blog_content" },
            (error, uploadResult) => {
              if (error) reject(error);
              return resolve(uploadResult);
            },
          )
          .end(file?.data ? file.data : file);
      },
    );

    if (!upload) return { error: true, message: "Terjadi kesalahan" };

    const data = {
      format: upload.format,
      url: upload.secure_url,
    };

    return { error: false, message: "Upload sukses", data };
  } catch (e) {
    console.error(e);
    const error = e as Error;
    return {
      error: true,
      message: error.message.includes("not allowed")
        ? error.message
        : "Terjadi kesalahan",
    };
  }
}

export async function uploadImageImbb(file: Buffer | any) {
  try {
    const formData = new FormData();
    formData.append("image", file.toString("base64"));

    const upload = await fetch(
      "https://api.imgbb.com/1/upload?key=" + process.env.IMGBB_KEY,
      {
        method: "POST",
        body: formData,
      },
    ).then((res) => res.json());

    if (upload?.status !== 200)
      return { error: true, message: "Terjadi kesalahan" };

    const data = {
      format: upload.data.image.extension,
      url: upload.data.display_url,
    };

    return { error: false, message: "Upload sukses", data };
  } catch (e) {
    console.error(e);
    const error = e as Error;
    return {
      error: true,
      message: error.message.includes("not allowed")
        ? error.message
        : "Terjadi kesalahan",
    };
  }
}
