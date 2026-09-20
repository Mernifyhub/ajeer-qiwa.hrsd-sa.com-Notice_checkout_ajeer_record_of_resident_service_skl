"use client";

import { useState } from "react";
import type { Strings } from "../lib/i18n";

export default function HelpWidget({ t }: { t: Strings }) {
  const [open, setOpen] = useState(false);
  const side = t.dir === "rtl" ? "right-6" : "left-6";

  return (
    <div className={`fixed bottom-6 z-40 ${side} print:hidden`}>
      {open && (
        <div className="animate-toast-in mb-3 w-[300px] rounded-xl border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(16,24,40,0.16)] sm:w-[340px]">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[16px] font-bold text-ajeer-ink">{t.helpTitle}</h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t.close}
              className="-mt-1 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-[13.5px] leading-6 text-slate-500">{t.helpBody}</p>
          <ul className="mt-4 space-y-2.5">
            {t.helpItems.map((item) => (
              <li key={item} className="flex gap-2.5 text-[13.5px] leading-6 text-slate-600">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ajeer-teal" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full bg-ajeer-navy px-6 py-3 text-[15px] font-medium text-white shadow-[0_8px_20px_rgba(27,42,99,0.28)] transition hover:bg-ajeer-navy-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-ajeer-navy/40 focus-visible:ring-offset-2"
      >
        {t.help}
      </button>
    </div>
  );
}
