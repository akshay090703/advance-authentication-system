import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/home", "/sessions"];
const publicRoutes = [
  "/",
  "/signup",
  "/verify-mfa",
  "/confirm-account",
  "/forgot-password",
  "/reset-password",
];

export default async function middleware(req: NextRequest, res: NextResponse) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  const accessToken = req.cookies.get("accessToken")?.value;

  if (isProtectedRoute && !accessToken) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  if (isPublicRoute && accessToken) {
    return NextResponse.redirect(new URL("/home", req.nextUrl.origin));
  }

  return NextResponse.next();
}
