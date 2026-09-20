"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HelpWidget from "@/components/HelpWidget";
import { Field, PermitCard, StatusBadge, type StatusTone } from "@/components/PermitCard";
import { CheckIcon, LinkIcon, PrintIcon } from "@/components/Logos";
import { strings, type Lang } from "@/lib/i18n";
import type { Permit, PermitStatus } from "@/lib/types";

const STATUS_TONE: Record<PermitStatus, StatusTone> = {
  Active: "green",
  Sari: "green",
  Expired: "red",
  Pending: "amber",
};

export default function PermitPage() {
  const [lang, setLang] = useState<Lang>("en");
  const [copied, setCopied] = useState(false);
  const [permit, setPermit] = useState<Permit | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");

  // Human verification gate — only on first page load
  const [gateOpen, setGateOpen] = useState(true);
  const [gateChecked, setGateChecked] = useState(false);
  const [gateLoading, setGateLoading] = useState(false);

  // Custom alert state
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const t = useMemo(() => strings[lang], [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = t.dir;
    document.title = t.pageTitle;
  }, [lang, t]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const id = new URLSearchParams(window.location.search).get("id");
        let data: Permit | null = null;

        if (id) {
          const res = await fetch(`/api/permits/${encodeURIComponent(id)}`, { cache: "no-store" });
          if (res.ok) data = await res.json();
        } else {
          const res = await fetch("/api/permits", { cache: "no-store" });
          if (res.ok) {
            const list: Permit[] = await res.json();
            data = list[0] ?? null;
          }
        }

        if (cancelled) return;
        setPermit(data);
        setState(data ? "ready" : "missing");
      } catch {
        if (!cancelled) setState("missing");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2600);
    return () => window.clearTimeout(id);
  }, [copied]);

  // Close custom alert on Enter/Escape
  useEffect(() => {
    if (!alertMessage) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape") setAlertMessage(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [alertMessage]);

  const toggleLang = useCallback(() => setLang((v) => (v === "en" ? "ar" : "en")), []);

  const runGateCheck = useCallback(() => {
    if (gateLoading || gateChecked) return;
    setGateLoading(true);
    window.setTimeout(() => {
      setGateChecked(true);
      setGateLoading(false);
      window.setTimeout(() => setGateOpen(false), 500);
    }, 900);
  }, [gateLoading, gateChecked]);

  const copyLink = useCallback(async () => {
    const url = permit
      ? `${window.location.origin}${window.location.pathname}?id=${encodeURIComponent(permit.id)}`
      : window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    // Custom alert — shows fake domain instead of long vercel URL
    setAlertMessage("تم نسخ الرابط بنجاح");
    setCopied(true);
  }, [permit]);

  const aria = lang === "ar" ? "font-ar" : "";

  return (
    <div dir={t.dir} className={`flex min-h-screen flex-col bg-ajeer-bg print:bg-transparent ${aria}`}>
      {/* CSS injection specifically for print style fixes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Force colors and backgrounds to render on print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body {
            background-color: #fafdff !important;
          }
          /* Prevent cards from breaking awkwardly across pages */
          .print-card-container {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}} />

      <div className="print:hidden">
        <Header t={t} onToggleLang={toggleLang} />
      </div>

      <main className="flex-1 print:p-0 print:m-0">
        <div className="mx-auto w-full max-w-[1245px] px-5 pb-14 pt-8 sm:px-8 print:max-w-full print:p-0 print:pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3 print:mb-4">
            <h1 className="text-[26px] font-bold tracking-tight text-ajeer-ink sm:text-[28px] print:text-[22px]">
              {t.pageTitle}
            </h1>
          </div>

          {state === "loading" && (
            <div className="mt-7">
              <p className="text-[14px] text-slate-500">{t.loadingPermit}</p>
              <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-lg border border-slate-200/80 bg-white px-6 pb-8 pt-6 sm:min-h-[350px]"
                  >
                    <div className="h-6 w-2/3 rounded bg-slate-200" />
                    <div className="mt-6 space-y-5">
                      {[0, 1, 2, 3].map((j) => (
                        <div key={j} className="space-y-2">
                          <div className="h-3.5 w-1/3 rounded bg-slate-100" />
                          <div className="h-4 w-1/2 rounded bg-slate-200" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {state === "missing" && (
            <div className="animate-fade-up mx-auto mt-12 max-w-[520px] rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <path d="M12 8v5M12 16.5v.5" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </div>
              <h2 className="mt-4 text-[20px] font-bold text-ajeer-ink">{t.notFoundTitle}</h2>
              <p className="mt-2 text-[14.5px] leading-6 text-slate-500">{t.notFoundBody}</p>
              <Link
                href="/admin-by-admin"
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-ajeer-navy px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-ajeer-navy-dark print:hidden"
              >
                {t.manageLink}
              </Link>
            </div>
          )}

          {state === "ready" && permit && (
            <>
              {/* Force grid layout (3 columns) on printing to match the web view */}
              <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 print:gap-4 print:mt-2">
                <div className="print-card-container">
                  <PermitCard title={t.permitInformation} delay={0}>
                    <Field label={t.employeeName} value={permit.employeeName} isArabicValue />
                    <Field
                      label={t.permitStatus}
                      value={<StatusBadge label={t.statusLabels[permit.status]} tone={STATUS_TONE[permit.status]} />}
                    />
                    <Field label={t.permitStartDate} value={permit.startDate} />
                    <Field label={t.permitEndDate} value={permit.endDate} />
                  </PermitCard>
                </div>

                <div className="print-card-container">
                  <PermitCard title={t.beneficiaryEstablishment} delay={90}>
                    <Field label={t.establishmentName} value={permit.beneficiary.name} isArabicValue />
                    <Field label={t.establishmentNumber} value={permit.beneficiary.number} />
                  </PermitCard>
                </div>

                <div className="print-card-container">
                  <PermitCard title={t.providerEstablishment} delay={180}>
                    <Field label={t.establishmentName} value={permit.provider.name} isArabicValue />
                    <Field label={t.establishmentNumber} value={permit.provider.number} />
                  </PermitCard>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3 print:hidden">
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex items-center gap-2.5 rounded-md bg-ajeer-navy px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_4px_12px_rgba(27,42,99,0.18)] transition hover:bg-ajeer-navy-dark active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-ajeer-navy/40 focus-visible:ring-offset-2"
                >
                  {copied ? <CheckIcon className="h-[18px] w-[18px]" /> : <LinkIcon className="h-[18px] w-[18px]" />}
                  {t.copyPageLink}
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <div className="print:hidden">
        <Footer t={t} onToggleLang={toggleLang} />
        <div className="h-24 bg-ajeer-bg" />
      </div>

      <div className="print:hidden">
        <HelpWidget t={t} />
      </div>

      {/* Custom Alert Modal — mimics browser alert with fake domain */}
      {alertMessage && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center bg-black/40 px-4 pt-20 print:hidden"
          role="dialog"
          aria-modal="true"
          onClick={() => setAlertMessage(null)}
        >
          <div
            className="w-full max-w-[420px] overflow-hidden rounded-lg bg-[#2b2b2b] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            <div className="px-5 pt-4 pb-2 text-[15px] font-semibold text-white">
              ajeer-qiwa.hrsd-sa.com says
            </div>
            <div
              className="px-5 pb-5 pt-1 text-[14px] text-[#e0e0e0] min-h-[40px]"
              dir="rtl"
              style={{ textAlign: "right" }}
            >
              {alertMessage}
            </div>
            <div className="flex justify-end gap-2 px-5 py-3">
              <button
                type="button"
                autoFocus
                onClick={() => setAlertMessage(null)}
                className="rounded-full bg-[#7dd3c0] px-8 py-1.5 text-[14px] font-semibold text-[#1a1a1a] transition hover:bg-[#6bc5b0] focus:outline-none"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Human verification — Arabic only, shown once on first page load */}
      {gateOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 print:hidden"
          role="dialog"
          aria-modal="true"
          dir="rtl"
        >
          <div className="animate-fade-up w-full max-w-[440px] rounded-xl bg-white p-8 shadow-2xl font-ar" dir="rtl">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500 text-white">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3v18" strokeLinecap="round" />
                </svg>
              </div>

              <h2 className="mt-5 text-[19px] font-bold text-ajeer-ink font-ar">
                التحقق من الكابتشا
              </h2>
              <p className="mt-2 text-[13.5px] leading-6 text-slate-500 font-ar">
                لعرض تفاصيل التصريح، يرجى إكمال التحقق من الكابتشا
              </p>

              <div className="mt-6 flex w-full max-w-[320px] items-center justify-between rounded-md border border-slate-300 bg-slate-50 px-4 py-3" dir="ltr">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={runGateCheck}
                    disabled={gateLoading || gateChecked}
                    aria-label="Verify"
                    className="flex h-7 w-7 items-center justify-center rounded border-2 border-slate-400 bg-white transition hover:border-slate-500 disabled:cursor-not-allowed"
                  >
                    {gateLoading && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />
                    )}
                    {gateChecked && !gateLoading && (
                      <svg viewBox="0 0 24 24" className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={3}>
                        <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <span className="text-[14px] text-slate-700">I&apos;m not a robot</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M21 12a9 9 0 11-9-9c2.5 0 4.7 1 6.4 2.6" strokeLinecap="round" />
                      <path d="M21 3v6h-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="mt-0.5 text-[9px] font-semibold text-slate-500">reCAPTCHA</span>
                </div>
              </div>

              <Link
                href="/"
                className="mt-6 inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-6 py-2.5 text-[13.5px] font-medium text-ajeer-ink transition hover:bg-slate-50 font-ar"
              >
                العودة إلى الصفحة الرئيسية
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}