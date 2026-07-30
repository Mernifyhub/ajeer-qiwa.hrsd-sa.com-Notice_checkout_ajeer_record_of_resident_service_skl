// import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
  delay?: number;
};

export function PermitCard({ title, children, delay = 0 }: Props) {
  return (
    <section
      className="animate-fade-up rounded-lg border border-slate-200/80 bg-white px-6 pb-8 pt-6 shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition duration-300 hover:shadow-[0_8px_24px_rgba(27,42,99,0.08)] sm:min-h-[350px]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <h2 className="border-b border-slate-200 pb-4 text-[21px] font-bold tracking-tight text-ajeer-ink">
        {title}
      </h2>
      <dl className="mt-5 space-y-5">{children}</dl>
    </section>
  );
}

type FieldProps = {
  label: string;
  value?: ReactNode;
  isArabicValue?: boolean;
};

export function Field({ label, value, isArabicValue = false }: FieldProps) {
  return (
    <div className="space-y-2">
      <dt className="text-[15px] text-slate-500">{label}</dt>
      <dd
        className={
          "text-[15px] text-slate-700 " + (isArabicValue ? "font-ar leading-7" : "tabular-nums")
        }
      >
        {value}
      </dd>
    </div>
  );
}

const TONES = {
  green: "bg-ajeer-green",
  red: "bg-red-500",
  amber: "bg-amber-500",
} as const;

export type StatusTone = keyof typeof TONES;

export function StatusBadge({ label, tone = "green" }: { label: string; tone?: StatusTone }) {
  return (
    <span
      className={`inline-flex items-center rounded-[3px] px-2.5 py-1.5 text-[14px] font-semibold text-white shadow-sm ${TONES[tone]}`}
    >
      {label}
    </span>
  );
}