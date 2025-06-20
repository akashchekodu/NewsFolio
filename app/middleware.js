// middleware.js
import { NextResponse } from 'next/server';

const ALLOWED_ORIGINS = new Set([
  'https://newsfolio.vercel.app',
  'https://financial-news-nextjs-3o2y.vercel.app',
]);

export function middleware(req) {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');

  if (
    origin && !ALLOWED_ORIGINS.has(origin) ||
    referer && ![...ALLOWED_ORIGINS].some(allowed => referer.startsWith(allowed))
  ) {
    return new Response('Forbidden', { status: 403 });
  }

  return NextResponse.next();
}


// ✅ Apply only to /api/* routes
export const config = {
  matcher: ['/api/:path*'],
};
