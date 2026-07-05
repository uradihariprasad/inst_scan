import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/lib/upstox-api";

export async function POST(req: NextRequest) {
  try {
    const { accessToken } = await req.json();
    if (!accessToken || typeof accessToken !== "string") {
      return NextResponse.json({ valid: false, error: "Access token is required" }, { status: 400 });
    }

    const valid = await validateToken(accessToken.trim());
    if (valid) {
      return NextResponse.json({ valid: true });
    }
    return NextResponse.json({ valid: false, error: "Invalid access token" }, { status: 401 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ valid: false, error: message }, { status: 500 });
  }
}
