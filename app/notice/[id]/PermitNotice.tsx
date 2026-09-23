"use client";

import { useEffect, useState, useRef, type ReactNode } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { AjeerLogo, MhrsdLogo, PrintIcon } from "@/components/Logos";
import type { Permit } from "@/lib/types";

// ডাউনলোড আইকন
function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

const DECLARATIONS = [
  "أقر أنا المنشأة المقدمة للخدمة والموضحة بياناتي أعلاه وأتعهد بـ:",
  "أن العامل حامل هذا التصريح يعمله لم يقر ويتعهد بأن البيانات المدونة فيه صحيحة على مسؤوليتي الشخصية، وأنه يعمل لدى المنشأة ولحسابها، بموجب رخصة إقامة سارية المفعول، وأتحمل أي تبعات قانونية أو غرامات تترتب على خلاف المذكور.",
  "الالتزام والتقيد بأنظمة العمل والعمال وأي أنظمة ولوائح وقرارات أخرى ذات علاقة.",
  "أن الموقع الإلكتروني الخاص بأجير حلول الموارد البشرية أو القائمين عليه عبارة عن وسيط إلكتروني ما بين الباحثين عن العمل وأصحاب الأعمال فقط وبدون أي التزام قانوني أو غيره على القائمين على موقع أجير.",
  "أي تعديل أو كشط في هذا التصريح يجعله لاغياً.",
];

const v = (s?: string) => (s && s.trim() ? s : "—");

/* ---------- Table Building Blocks ---------- */

function DocTable({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border border-slate-400">
      <div className="border-b border-slate-400 bg-slate-100 px-3 py-2 text-center">
        <h3 className="text-[13px] font-bold text-slate-800">{title}</h3>
      </div>
      <div className="divide-y divide-slate-400">{children}</div>
    </section>
  );
}

function DocRow({
  label1,
  value1,
  label2,
  value2,
  ltr1 = false,
  ltr2 = false,
}: {
  label1: { ar: string; en: string };
  value1: string;
  label2?: { ar: string; en: string };
  value2?: string;
  ltr1?: boolean;
  ltr2?: boolean;
}) {
  return (
    <div className="grid grid-cols-4 divide-x divide-slate-400 divide-x-reverse">
      <div className="flex flex-col justify-center gap-0.5 bg-slate-50 px-3 py-2.5">
        <span className="text-[11.5px] font-semibold leading-4 text-slate-700">
          {label1.ar}
        </span>
        <span dir="ltr" className="text-right text-[9.5px] leading-3 text-slate-500">
          {label1.en}
        </span>
      </div>
      <div
        dir={ltr1 ? "ltr" : undefined}
        className="flex items-center justify-center break-all bg-white px-2 py-2.5 text-center text-[12.5px] font-semibold text-slate-800"
      >
        {value1}
      </div>
      {label2 ? (
        <div className="flex flex-col justify-center gap-0.5 bg-slate-50 px-3 py-2.5">
          <span className="text-[11.5px] font-semibold leading-4 text-slate-700">
            {label2.ar}
          </span>
          <span dir="ltr" className="text-right text-[9.5px] leading-3 text-slate-500">
            {label2.en}
          </span>
        </div>
      ) : (
        <div className="bg-slate-50" />
      )}
      {value2 !== undefined ? (
        <div
          dir={ltr2 ? "ltr" : undefined}
          className="flex items-center justify-center break-all bg-white px-2 py-2.5 text-center text-[12.5px] font-semibold text-slate-800"
        >
          {value2}
        </div>
      ) : (
        <div className="bg-white" />
      )}
    </div>
  );
}

/* ---------- Main Component ---------- */

export default function PermitNotice({ id }: { id: string }) {
  const [permit, setPermit] = useState<Permit | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");
  const [qr, setQr] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const documentRef = useRef<HTMLElement>(null);

  // পেজ লোড হওয়ার সাথে সাথে CDN স্ক্রিপ্ট ব্যাকগ্রাউন্ডে লোড হবে
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).html2pdf) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.async = true;
      script.crossOrigin = "anonymous";
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/permits/${encodeURIComponent(id)}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          if (!cancelled) setState("missing");
          return;
        }
        const data: Permit = await res.json();
        if (cancelled) return;
        setPermit(data);
        setState("ready");

        const url = `https://ajeer-qiwa-hrsd-sa-com-notice-check.vercel.app/Notice_checkout_ajeer_record_of_resident_service_skl.php?id=${encodeURIComponent(data.id)}`;
        const png = await QRCode.toDataURL(url, {
          width: 480,
          margin: 1,
          errorCorrectionLevel: "M",
          color: { dark: "#111111", light: "#ffffff" },
        });
        if (!cancelled) setQr(png);
      } catch {
        if (!cancelled) setState("missing");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDownloadPdf = async () => {
    if (!documentRef.current) return;
    
    const html2pdf = (window as any).html2pdf;
    if (!html2pdf) {
      alert("PDF download library is loading, please try again in a second.");
      return;
    }

    setIsDownloading(true);

    try {
      const opt = {
        margin: [4, 4, 4, 4],
        filename: `Ajeer-Permit-${permit?.id || "notice"}.pdf`,
        image: { type: "jpeg", quality: 1.0 },
        html2canvas: { scale: 3, useCORS: true, scrollY: 0 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(documentRef.current).save();
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="animate-pulse text-[14px] text-slate-500">
          Loading permit notice…
        </p>
      </div>
    );
  }

  if (state === "missing" || !permit) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100 px-6 text-center">
        <p className="text-[18px] font-bold text-slate-800">Permit not found</p>
        <Link
          href="/admin"
          style={{ padding: '10px 20px', background: '#2563eb', color: '#ffffff', borderRadius: '6px', textDecoration: 'none', fontWeight: 600 }}
        >
          Back to Management
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6 print:bg-white print:py-0">
      <div className="mx-auto w-full max-w-[820px] px-4 sm:px-6 print:max-w-none print:px-0">
        
        {/* Toolbar */}
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '16px', 
            background: '#ffffff', 
            padding: '12px', 
            borderRadius: '8px', 
            border: '1px solid #cbd5e1' 
          }} 
          className="print:hidden"
        >
          <Link
            href="/admin"
            style={{ 
              padding: '8px 16px', 
              background: '#f1f5f9', 
              borderRadius: '6px', 
              fontSize: '14px', 
              fontWeight: 600, 
              color: '#334155', 
              textDecoration: 'none' 
            }}
          >
            ← Back to Management
          </Link>

          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Download PDF Button */}
            <button
              type="button"
              disabled={isDownloading}
              onClick={handleDownloadPdf}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                background: '#059669', 
                color: '#ffffff', 
                padding: '8px 18px', 
                borderRadius: '6px', 
                fontSize: '14px', 
                fontWeight: 600, 
                border: 'none', 
                cursor: 'pointer' 
              }}
            >
              <DownloadIcon className="h-4 w-4 text-white" />
              {isDownloading ? "Downloading..." : "Download PDF"}
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={() => window.print()}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                background: '#1e293b', 
                color: '#ffffff', 
                padding: '8px 18px', 
                borderRadius: '6px', 
                fontSize: '14px', 
                fontWeight: 600, 
                border: 'none', 
                cursor: 'pointer' 
              }}
            >
              <PrintIcon className="h-4 w-4" />
              Print
            </button>
          </div>
        </div>

        {/* Paper Document */}
        <article
          ref={documentRef}
          dir="rtl"
          className="font-ar mt-5 bg-white p-6 shadow-[0_10px_30px_rgba(16,24,40,0.10)] ring-1 ring-slate-200 sm:p-10 print:mt-0 print:p-0 print:shadow-none print:ring-0"
        >
          {/* Header */}
          <header dir="ltr" className="flex items-center justify-between border border-slate-300 p-2">
            <div className="shrink-0 border border-slate-300 bg-white p-2">
              {qr ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qr}
                  alt={`QR — ${permit.id}`}
                  className="h-[170px] w-[170px] sm:h-[190px] sm:w-[190px]"
                />
              ) : (
                <div className="h-[170px] w-[170px] animate-pulse bg-slate-100 sm:h-[190px] sm:w-[190px]" />
              )}
            </div>

            <div className="flex items-center gap-2">
              <h1
                dir="rtl"
                className="text-right text-[16px] font-bold leading-7 text-slate-700"
              >
                إشعار أجير حلول الموارد
                <br />
                البشرية
              </h1>
              <AjeerLogo className="h-12 w-auto" />
              <MhrsdLogo className="h-12 w-auto" />
            </div>
          </header>

          {/* Intro paragraph */}
          <p className="mt-8 text-justify text-[12px] leading-[24px] text-slate-700">
            نشعركم أنه تم التعاقد من قبلنا كجهة مقدمة للخدمة مع الجهة المستفيدة من
            الخدمة حسب المعلومات المبينة أدناه، وذلك تم تسجيل معلومات العقد لتكون
            بحوزة العامل لإثبات عدم مخالفته لنظام العمل ولتقديمها إلى من يهمه الأمر
            من الجهات المختصة عند طلبها للتحقق من صحة تواجده في مكان تقديم الخدمة.
          </p>

          {/* Tables */}
          <div className="mt-6 space-y-3">
            <DocTable title="بيانات العامل  Laborer Information">
              <DocRow
                label1={{ ar: "اسم العامل", en: "Laborer Name" }}
                value1={v(permit.employeeName)}
                label2={{ ar: "المهنة", en: "Occupation" }}
                value2={v(permit.occupation)}
              />
              <DocRow
                label1={{ ar: "رقم الهوية / الإقامة", en: "ID Number" }}
                value1={v(permit.idNumber)}
                ltr1
                label2={{ ar: "الجنسية", en: "Nationality" }}
                value2={v(permit.nationality)}
              />
            </DocTable>

            <DocTable title="بيانات مقدم الخدمة  Provider Information">
              <DocRow
                label1={{ ar: "المنشأة المقدمة للخدمة", en: "Provider Establishment" }}
                value1={v(permit.provider.name)}
                label2={{
                  ar: "رقم المنشأة في وزارة الموارد البشرية والتنمية الاجتماعية",
                  en: "Establishment Number",
                }}
                value2={v(permit.provider.number)}
                ltr2
              />
            </DocTable>

            <DocTable title="بيانات المستفيد من الخدمة  Beneficiary Information">
              <DocRow
                label1={{
                  ar: "المنشأة المستفيدة من الخدمة",
                  en: "Beneficiary Establishment",
                }}
                value1={v(permit.beneficiary.name)}
                label2={{
                  ar: "رقم المنشأة في وزارة الموارد البشرية والتنمية الاجتماعية",
                  en: "Establishment Number",
                }}
                value2={v(permit.beneficiary.number)}
                ltr2
              />
            </DocTable>

            <DocTable title="بيانات التصريح  Permit Information">
              <DocRow
                label1={{ ar: "تاريخ بداية التصريح", en: "Permit Start Date" }}
                value1={v(permit.startDate)}
                ltr1
                label2={{ ar: "تاريخ نهاية التصريح", en: "Permit End Date" }}
                value2={v(permit.endDate)}
                ltr2
              />
            </DocTable>
          </div>

          {/* Declarations Section */}
          <div className="mt-8">
            <h3 className="text-center text-[14px] font-bold text-slate-900">
              إقرارات
            </h3>
            <p className="mt-3 text-[11.5px] font-semibold leading-6 text-slate-700">
              {DECLARATIONS[0]}
            </p>
            <ul className="mt-2 list-disc space-y-2 pe-5 text-[11px] leading-[22px] text-slate-600">
              {DECLARATIONS.slice(1).map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        </article>
      </div>
    </div>
  );
}