import { NextResponse } from "next/server";
import { nextPermitId, normalizeInput, readPermits, writePermits } from "@/lib/db";
import type { Permit } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/permits — list all permits (newest first) */
export async function GET() {
  const permits = await readPermits();
  return NextResponse.json(permits);
}

/** POST /api/permits — create a permit with an auto-generated dynamic ID */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const input = normalizeInput(body);
  if ("error" in input) {
    return NextResponse.json({ error: input.error }, { status: 400 });
  }

  const permits = await readPermits();
  const now = new Date();
  const permit: Permit = {
    id: nextPermitId(permits, now),
    ...input,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  permits.unshift(permit);
  await writePermits(permits);
  return NextResponse.json(permit, { status: 201 });
}
