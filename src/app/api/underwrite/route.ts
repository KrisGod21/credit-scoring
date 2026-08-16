import { NextRequest, NextResponse } from "next/server";
import { underwriteRequestSchema } from "@/lib/underwriting/schema";
import { UNDERWRITING_PERSONAS, getHistoryForPersona } from "@/lib/underwriting/personas";
import { buildCustomOccupationProfile } from "@/lib/underwriting/occupation-profiles";
import { generateTransactionHistory } from "@/lib/underwriting/transaction-generator";
import { buildFinancialPassport } from "@/lib/underwriting/passport-builder";
import type { TransactionHistory } from "@/lib/underwriting/types";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = underwriteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { personaId, manual, requestedAmount, tenureMonths } = parsed.data;

  let history: TransactionHistory;
  let applicantLabel: string;

  if (personaId) {
    const persona = UNDERWRITING_PERSONAS.find((p) => p.id === personaId);
    if (!persona) {
      return NextResponse.json({ error: `Unknown personaId "${personaId}".` }, { status: 400 });
    }
    history = getHistoryForPersona(persona);
    applicantLabel = `${persona.name} · ${persona.role}`;
  } else if (manual) {
    const profile = buildCustomOccupationProfile(manual);
    history = generateTransactionHistory("manual-applicant", manual.occupation, profile);
    applicantLabel = "Your profile";
  } else {
    return NextResponse.json({ error: "Provide either personaId or manual profile inputs." }, { status: 400 });
  }

  try {
    const passport = buildFinancialPassport({ applicantLabel, history, requestedAmount, tenureMonths });
    return NextResponse.json(passport);
  } catch (err) {
    console.error("Underwriting pipeline failed", err);
    return NextResponse.json({ error: "The underwriting engine is temporarily unavailable." }, { status: 503 });
  }
}
