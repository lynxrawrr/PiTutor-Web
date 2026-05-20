import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

const protectedPrefixes = ["/dashboard"];

export async function middleware(request: NextRequest) {
  const isProtected = protectedPrefixes.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const secureCookie =
    request.nextUrl.protocol === "https:" ||
    process.env.AUTH_URL?.startsWith("https://") ||
    process.env.NEXTAUTH_URL?.startsWith("https://");

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie,
  });

  if (!token) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set(
      "callbackUrl",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
