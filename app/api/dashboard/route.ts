import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("agrivet_access")?.value;
  if (!token) return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  const response = await fetch(`${API_URL}/farmer/dashboard/`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  return NextResponse.json(await response.json(), { status: response.status });
}