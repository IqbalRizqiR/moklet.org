import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

import AdminLayout from "./components/AdminLayout";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return <AdminLayout>{children}</AdminLayout>;
}

export const revalidate = 900;
