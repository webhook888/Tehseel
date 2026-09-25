import { NextResponse } from "next/server";

const encoder = new TextEncoder();
const secret =
  process.env.AUTH_SECRET || "change-this-in-production-invoice-app";

async function signed(token) {
  const [payload, signature] = (token || "").split(".");
  if (!payload || !signature) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const hash = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const expected = btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  if (expected !== signature) return false;
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    return (
      JSON.parse(atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4))).exp >
      Date.now()
    );
  } catch {
    return false;
  }
}

export async function middleware(request) {
  if (await signed(request.cookies.get("invoice_session")?.value))
    return NextResponse.next();
  if (request.nextUrl.pathname.startsWith("/api/"))
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard", "/invoices/:path*", "/api/invoices/:path*"],
};
