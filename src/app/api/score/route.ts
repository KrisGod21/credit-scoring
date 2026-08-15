import { NextRequest, NextResponse } from "next/server";
import { profileSchema } from "@/lib/scoring/schema";
import { scoreProfile } from "@/lib/scoring/scoring-engine";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid profile data.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const result = scoreProfile(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Scoring engine failed", err);
    return NextResponse.json(
      { error: "The scoring model is temporarily unavailable." },
      { status: 503 }
    );
  }
}
