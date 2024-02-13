import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { agentSession, sessionOptions } from "./session.config";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const session = await getIronSession<agentSession>(cookies(), sessionOptions);
  if (!session.verified)
    return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!login|_next/static|_next/image|favicon.ico).*)",
  ],
};
