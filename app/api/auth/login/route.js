import { NextResponse } from "next/server";
import { createSessionToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  const { email, password, remember } = await request.json();
  const validEmail = process.env.LOGIN_EMAIL || "admin@example.com";
  const validPassword = process.env.LOGIN_PASSWORD || "admin123";
  if (email !== validEmail || password !== validPassword) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set("invoice_session", createSessionToken(), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/", maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 8,
  });
  return response;
}
