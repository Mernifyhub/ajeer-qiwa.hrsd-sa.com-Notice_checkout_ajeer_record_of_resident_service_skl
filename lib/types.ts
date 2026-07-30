export type PermitStatus = "Active" |"Sari" | "Expired" | "Pending";

export const STATUSES: PermitStatus[] = ["Active", "Sari", "Expired", "Pending"];

export interface Establishment {
  name: string;
  number: string;
}

export interface Permit {
  id: string; // auto-generated, e.g. AJR-2026-0001
  employeeName: string;
  occupation: string;
  nationality: string;
  idNumber: string;
  status: PermitStatus;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  beneficiary: Establishment;
  provider: Establishment;
  createdAt: string;
  updatedAt: string;
}

/** Payload accepted by POST /api/permits and PUT /api/permits/:id */
export interface PermitInput {
  employeeName: string;
  occupation: string;
  nationality: string;
  idNumber: string;
  status: PermitStatus;
  startDate: string;
  endDate: string;
  beneficiary: Establishment;
  provider: Establishment;
}
