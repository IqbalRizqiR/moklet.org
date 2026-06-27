"use server";

import { compareHash } from "@/utils/encryption";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";

export default async function checkPass(formdata: FormData, slug: string) {
  const destinationLink = await prisma.link_Shortener.findUnique({
    where: { slug: slug },
  });
  const pass = formdata.get("password") as string;
  const isMatch = destinationLink?.password ? compareHash(pass, destinationLink.password) : false;
  if (isMatch) {
    await prisma.link_Shortener_Count.upsert({
      where: { id: slug },
      update: { click_count: { increment: 1 } },
      create: { click_count: 1, id: slug },
    });
    redirect(destinationLink.target_url);
  }

  return { message: "Kata sandi salah!" };
}
