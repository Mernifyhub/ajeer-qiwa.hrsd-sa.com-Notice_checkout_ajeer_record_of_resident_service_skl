import { NextResponse } from "next/server";
import { normalizeInput, readPermits, writePermits } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/permits/:id — fetch one permit (public verification page uses this) */
export async function GET(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const permits = await readPermits();
  const permit = permits.find((p) => p.id === decodeURIComponent(id));
  if (!permit) {
    return NextResponse.json({ error: "Permit not found" }, { status: 404 });
  }
  return NextResponse.json(permit);
}

/** PUT /api/permits/:id — update (ID stays the same) */
export async function PUT(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
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
  const targetId = decodeURIComponent(id);
  const index = permits.findIndex((p) => p.id === targetId);
  if (index === -1) {
    return NextResponse.json({ error: "Permit not found" }, { status: 404 });
  }

  permits[index] = { ...permits[index], ...input, updatedAt: new Date().toISOString() };
  await writePermits(permits);
  return NextResponse.json(permits[index]);
}

/** DELETE /api/permits/:id */
export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const permits = await readPermits();
  const targetId = decodeURIComponent(id);
  const exists = permits.some((p) => p.id === targetId);
  if (!exists) {
    return NextResponse.json({ error: "Permit not found" }, { status: 404 });
  }
  await writePermits(permits.filter((p) => p.id !== targetId));
  return NextResponse.json({ ok: true, id: targetId });
}
