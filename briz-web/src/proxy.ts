import { NextResponse, type NextRequest } from "next/server";

// The live site (a production build) only serves the home page and the component
// playgrounds; every other page answers with the site's 404. Local development serves
// everything, and NEXT_PUBLIC_SHOW_ALL_PAGES=1 opens a production build up too.
// Keep this list in step with the `playground: true` components on the home page.
const LIVE_PATHS = new Set(["/", "/components/request-card", "/components/offer-card", "/components/notification"]);

const LOCKED = process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SHOW_ALL_PAGES !== "1";

export function proxy(request: NextRequest) {
  if (!LOCKED) return NextResponse.next();
  const path = request.nextUrl.pathname.replace(/\/+$/, "") || "/";
  if (LIVE_PATHS.has(path)) return NextResponse.next();
  // A path with no route renders app/not-found.tsx with a 404 status.
  return NextResponse.rewrite(new URL("/__not-on-live-site", request.url));
}

export const config = {
  // Pages only: Next's own files and anything with a file extension (images, icons) pass straight through.
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
