import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";
const cookieOptions = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 };

export async function POST(request: Request) {
  const body = await request.json();
  const endpoint = body.action === "signup" ? "auth/signup/" : "auth/login/";
  const payload = body.action === "signup" ? body : { username: body.phone, password: body.password };
  const response = await fetch(`${API_URL}/${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), cache: "no-store" });
  const result = await response.json();
  if (!response.ok) return NextResponse.json({ success: false, message: result.detail ?? "Invalid credentials." }, { status: response.status });
  if (body.action === "signup") return NextResponse.json({ success: true, message: result.message });
  const nextResponse = NextResponse.json({ success: true, message: "Welcome back.", user: { name: result.username, role: result.role } });
  nextResponse.cookies.set("agrivet_access", result.access, cookieOptions);
  nextResponse.cookies.set("agrivet_refresh", result.refresh, { ...cookieOptions, maxAge: 60 * 60 * 24 * 7 });
  return nextResponse;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("agrivet_access");
  response.cookies.delete("agrivet_refresh");
  return response;
}