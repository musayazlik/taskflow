import { NextRequest, NextResponse } from "next/server";

interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  image?: string | null;
  emailVerified?: boolean;
}

interface SessionData {
  user: SessionUser;
  session: { token: string; expiresAt: string };
}

function resolveBackendUrl(): string {
  return (
    process.env.INTERNAL_API_URL ||
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4101"
  ).replace(/\/$/, "");
}

async function getSessionFromBackend(
  cookieHeader: string,
): Promise<SessionData | null> {
  if (!cookieHeader) return null;

  try {
    const apiUrl = resolveBackendUrl();
    const response = await fetch(`${apiUrl}/api/auth/get-session`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data?.user) return null;

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role || "USER",
        image: data.user.image,
        emailVerified: data.user.emailVerified,
      },
      session: data.session,
    };
  } catch {
    return null;
  }
}

/**
 * Next.js 16 Proxy (replaces middleware.ts)
 * Session check: blocks signed-in users from auth pages and unauthenticated users from panel.
 * Reads cookies directly from the request and validates against the backend API.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicPaths = ["/legal", "/changelog", "/contact"];
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const needsSession =
    pathname.startsWith("/panel") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/resend-verification");

  if (!needsSession) {
    return NextResponse.next();
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const session = await getSessionFromBackend(cookieHeader);

  // resend-verification: unverified users can access
  if (pathname.startsWith("/resend-verification")) {
    if (session?.user && session.user.emailVerified) {
      return NextResponse.redirect(new URL("/panel", request.url));
    }
    return NextResponse.next();
  }

  // Auth pages: redirect signed-in users to panel
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/verify-email")
  ) {
    if (session?.user) {
      return NextResponse.redirect(new URL("/panel", request.url));
    }
    return NextResponse.next();
  }

  // Panel: redirect unauthenticated users to login
  if (pathname.startsWith("/panel")) {
    if (!session?.user) {
      const callbackUrl = encodeURIComponent(pathname);
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${callbackUrl}`, request.url),
      );
    }

    if (!session.user.emailVerified) {
      return NextResponse.redirect(
        new URL("/resend-verification", request.url),
      );
    }

    const userRole = session.user.role || "USER";
    const adminOnlyPaths = ["/panel/users", "/panel/security", "/panel/rbac"];

    for (const adminPath of adminOnlyPaths) {
      if (pathname.startsWith(adminPath)) {
        if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
          return NextResponse.redirect(
            new URL("/panel?error=unauthorized", request.url),
          );
        }
      }
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

/**
 * Matcher: which routes are handled by this middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
