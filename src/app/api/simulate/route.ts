import { NextRequest, NextResponse } from "next/server";
import { whatIfSchema } from "@/lib/underwriting/schema";
import { simulateUnderwriting } from "@/lib/underwriting/what-if";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = whatIfSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid inputs.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const result = simulateUnderwriting(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    console.error("What-if simulation failed", err);
    return NextResponse.json({ error: "The simulator is temporarily unavailable." }, { status: 503 });
  }
}
