import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const match = request.nextUrl.pathname.match(
    /^\/admin\/preguntas\/(\d+)\/editar$/,
  );

  if (!match) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/admin/preguntas";
  url.searchParams.set("editar", match[1]);

  return NextResponse.redirect(url);
}

export const config = {
  matcher: "/admin/preguntas/:path*",
};
