import { NextRequest, NextResponse } from "next/server";
import { getOptionChain } from "@/lib/upstox-api";
import { analyzeOptionChain } from "@/lib/analysis-engine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { accessToken, instrumentKey, expiryDate } = await req.json();
    if (!accessToken) {
      return NextResponse.json({ error: "Access token required" }, { status: 401 });
    }
    if (!instrumentKey) {
      return NextResponse.json({ error: "Instrument key required" }, { status: 400 });
    }

    // Use provided expiry or get nearest Thursday
    const expiry = expiryDate || getNextExpiry();

    const optionChain = await getOptionChain(instrumentKey, expiry, accessToken);
    const analysis = analyzeOptionChain(optionChain);

    return NextResponse.json({
      instrumentKey,
      expiry,
      optionChain,
      analysis,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function getNextExpiry(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilThursday = (4 - dayOfWeek + 7) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilThursday);
  return next.toISOString().split("T")[0];
}
