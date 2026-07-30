import { promises as fs } from "fs";
import path from "path";
import { STATUSES, type Permit, type PermitInput, type PermitStatus } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "permits.json");

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(FILE);
  } catch {
    await fs.writeFile(FILE, "[]", "utf8");
  }
}

export async function readPermits(): Promise<Permit[]> {
  await ensureFile();
  const raw = await fs.readFile(FILE, "utf8");
  try {
    const list: unknown = JSON.parse(raw);
    return Array.isArray(list) ? (list as Permit[]) : [];
  } catch {
    return [];
  }
}

export async function writePermits(list: Permit[]): Promise<void> {
  await ensureFile();
  const tmp = `${FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(list, null, 2), "utf8");
  await fs.rename(tmp, FILE);
}

/** Dynamic sequential ID: AJR-<currentYear>-0001, 0002, ... */
export function nextPermitId(existing: Permit[], now = new Date()): string {
  const year = now.getFullYear();
  const prefix = `${year}`;
  let max = 0;
  for (const p of existing) {
    if (p.id.startsWith(prefix)) {
      const n = parseInt(p.id.slice(prefix.length), 10);
      if (!Number.isNaN(n) && n > max) max = n;
    }
  }
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

/** Validate + normalize an incoming request body into PermitInput. */
export function normalizeInput(body: unknown): PermitInput | { error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const est = (key: string) => {
    const v = (b[key] ?? {}) as Record<string, unknown>;
    return { name: String(v.name ?? "").trim(), number: String(v.number ?? "").trim() };
  };

  const employeeName = String(b.employeeName ?? "").trim();
  if (!employeeName) return { error: "employeeName is required" };

  const status: PermitStatus = STATUSES.includes(b.status as PermitStatus)
    ? (b.status as PermitStatus)
    : "Active";

  return {
    employeeName,
    occupation: String(b.occupation ?? "").trim(),
    nationality: String(b.nationality ?? "").trim(),
    idNumber: String(b.idNumber ?? "").trim(),
    status,
    startDate: String(b.startDate ?? ""),
    endDate: String(b.endDate ?? ""),
    beneficiary: est("beneficiary"),
    provider: est("provider"),
  };
}
