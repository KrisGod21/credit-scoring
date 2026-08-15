import { NextResponse } from "next/server";
import { getModelInfo } from "@/lib/scoring/scoring-engine";

export async function GET() {
  return NextResponse.json(getModelInfo());
}
