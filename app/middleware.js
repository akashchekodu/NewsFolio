// middleware.ts
import { NextResponse } from "next/server";

const ALLOWED_ORIGIN = "https://newsfolio.vercel.app";
const SECRET = process.env.API_SECRET_KEY;

export function middleware(req) {
  // only run on /api routes
  const apiKey = req.headers.get("x-api-key") || "";
  const origin = req.headers.get("origin") || "";
  const referer = req.headers.get("referer") || "";

  // check API key + origin/referer
  if (
    apiKey !== SECRET ||
    !(origin === ALLOWED_ORIGIN || referer.startsWith(ALLOWED_ORIGIN))
  ) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],  // only protect /api/* routes
};
