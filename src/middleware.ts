import { NextResponse } from "next/server";
import { auth } from "@/lib/auth.edge";
import { Roles } from "./types/enums";

import { protectedRoutes } from "./utils/protectedRoutes";

export default auth((req) => {
  const session = req.auth;
  const { pathname } = req.nextUrl;

  if (!session) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }

  const userRole = session.user?.role as Roles | undefined;
  // console.log(userRole);

  if (userRole === "Guest") {
    return NextResponse.rewrite(new URL("/unauthorized", req.url), {
      status: 403,
    });
  }

  const route = protectedRoutes.find((route) => route.regex.test(pathname));
  const isSubOrgan = userRole && !userRole.includes("Admin");

  const hasAccess =
    route &&
    (route.roles == "All" ||
      (userRole && route.roles.includes(userRole)) ||
      (isSubOrgan && route.roles.includes("SubOrgan")));

  if (route && !hasAccess) {
    return NextResponse.rewrite(new URL("/unauthorized", req.url), {
      status: 403,
    });
  }
});

export const config = {
  matcher: ["/admin/:path*", "/admin"],
};
