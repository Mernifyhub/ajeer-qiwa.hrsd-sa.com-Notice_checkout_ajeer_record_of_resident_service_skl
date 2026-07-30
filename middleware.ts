import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Match: /Notice_checkout_ajeer_record_of_resident_service_skl.php
  if (pathname === "/Notice_checkout_ajeer_record_of_resident_service_skl.php") {
    // Rewrite to home page (which shows permit based on ?id=)
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/Notice_checkout_ajeer_record_of_resident_service_skl.php"],
};