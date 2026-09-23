
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { AjeerLogo, MhrsdLogo, PrintIcon } from "@/components/Logos";
import type { Permit } from "@/lib/types";

const DECLARATIONS = [
  "أقر أنا المنشأة المقدمة للخدمة والموضحة بياناتي أعلاه وأتعهد بـ:",
  "أن العامل حامل هذا التصريح يعمله لم يقر ويتعهد بأن البيانات المدونة فيه صحيحة على مسؤوليتي الشخصية، وأنه يعمل لدى المنشأة ولحسابها، بموجب رخصة إقامة سارية المفعول، وأتحمل أي تبعات قانونية أو غرامات تترتب على خلاف المذكور.",
  "الالتزام والتقيد بأنظمة العمل والعمال وأي أنظمة ولوائح وقرارات أخرى ذات علاقة.",
  "أن الموقع الإلكتروني الخاص بأجير حلول الموارد البشرية أو القائمين عليه عبارة عن وسيط إلكتروني ما بين الباحثين عن العمل وأصحاب الأعمال فقط وبدون أي التزام قانوني أو غيره على القائمين على موقع أجير.",
  "أي تعديل أو كشط في هذا التصريح يجعله لاغياً.",
];

const v = (s?: string) => (s && s.trim() ? s : "—");

/* ---------- Table Building Blocks ---------- */

function DocTable({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-slate-400">
      <div className="border-b border-slate-400 bg-slate-100 px-3 py-2 text-center">
        <h3 className="text-[13px] font-bold text-slate-800">
          {title}
        </h3>
      </div>

      <div className="divide-y divide-slate-400">
        {children}
      </div>
    </section>
  );
}

/* ---------- Table Row ---------- */

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
      {/* Label 1 */}

      <div className="flex flex-col justify-center gap-0.5 bg-slate-50 px-3 py-2.5">
        <span className="text-[11.5px] font-semibold leading-4 text-slate-700">
          {label1.ar}
        </span>

        <span
          dir="ltr"
          className="text-right text-[9.5px] leading-3 text-slate-500"
        >
          {label1.en}
        </span>
      </div>

      {/* Value 1 */}

      <div
        dir={ltr1 ? "ltr" : undefined}
        className="flex items-center justify-center break-all bg-white px-2 py-2.5 text-center text-[12.5px] font-semibold text-slate-800"
      >
        {value1}
      </div>

      {/* Label 2 */}

      {label2 ? (
        <div className="flex flex-col justify-center gap-0.5 bg-slate-50 px-3 py-2.5">
          <span className="text-[11.5px] font-semibold leading-4 text-slate-700">
            {label2.ar}
          </span>

          <span
            dir="ltr"
            className="text-right text-[9.5px] leading-3 text-slate-500"
          >
            {label2.en}
          </span>
        </div>
      ) : (
        <div className="bg-slate-50" />
      )}

      {/* Value 2 */}

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

  const [state, setState] = useState<
    "loading" | "ready" | "missing"
  >("loading");

  const [qr, setQr] = useState("");

  const [downloading, setDownloading] = useState(false);

  const printRef = useRef<HTMLElement>(null);

  /* ---------- Fetch Permit ---------- */

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `/api/permits/${encodeURIComponent(id)}`,
          {
            cache: "no-store",
          }
        );

        if (!res.ok) {
          if (!cancelled) {
            setState("missing");
          }

          return;
        }

        const data: Permit = await res.json();

        if (cancelled) return;

        setPermit(data);
        setState("ready");

        /* ---------- QR ---------- */

        const url =
          `https://ajeer-qiwa-hrsd-sa-com-notice-check.vercel.app/` +
          `Notice_checkout_ajeer_record_of_resident_service_skl.php?id=` +
          `${encodeURIComponent(data.id)}`;

        const png = await QRCode.toDataURL(url, {
          width: 480,
          margin: 1,
          errorCorrectionLevel: "M",
          color: {
            dark: "#111111",
            light: "#ffffff",
          },
        });

        if (!cancelled) {
          setQr(png);
        }
      } catch {
        if (!cancelled) {
          setState("missing");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  /* =========================================================
     PDF DOWNLOAD
     ========================================================= */

  const handleDownload = async () => {
    if (!printRef.current || !permit) return;

    try {
      setDownloading(true);

      const element = printRef.current;

      /*
       * Wait for fonts and images to finish rendering.
       */

      await document.fonts.ready;

      const images = Array.from(
        element.querySelectorAll("img")
      );

      await Promise.all(
        images.map((img) => {
          if (img.complete) {
            return Promise.resolve();
          }

          return new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
        })
      );

      /*
       * html2canvas has a problem with modern CSS
       * color functions such as oklch().
       *
       * We create a temporary cloned document and
       * replace unsupported oklch colors there only.
       *
       * The actual page/design is NOT changed.
       */

      const canvas = await html2canvas(element, {
        scale: 2,

        useCORS: true,

        allowTaint: false,

        backgroundColor: "#ffffff",

        logging: false,

        imageTimeout: 15000,

        onclone: (clonedDocument) => {
          const clonedRoot =
            clonedDocument.querySelector(
              "[data-pdf-content='true']"
            ) as HTMLElement | null;

          if (!clonedRoot) return;

          const allElements = [
            clonedRoot,
            ...Array.from(
              clonedRoot.querySelectorAll("*")
            ),
          ] as HTMLElement[];

          /*
           * Force compatible colors only inside
           * the cloned PDF document.
           */

          allElements.forEach((el) => {
            const computed =
              clonedDocument.defaultView?.getComputedStyle(el);

            if (!computed) return;

            /*
             * Color
             */

            if (
              computed.color &&
              computed.color.includes("oklch")
            ) {
              el.style.setProperty(
                "color",
                "#334155",
                "important"
              );
            }

            /*
             * Background
             */

            if (
              computed.backgroundColor &&
              computed.backgroundColor.includes("oklch")
            ) {
              el.style.setProperty(
                "background-color",
                "#ffffff",
                "important"
              );
            }

            /*
             * Border colors
             */

            const borderProperties = [
              "border-top-color",
              "border-right-color",
              "border-bottom-color",
              "border-left-color",
            ];

            borderProperties.forEach((property) => {
              const value =
                computed.getPropertyValue(property);

              if (value && value.includes("oklch")) {
                el.style.setProperty(
                  property,
                  "#94a3b8",
                  "important"
                );
              }
            });

            /*
             * Outline
             */

            const outline =
              computed.getPropertyValue("outline-color");

            if (outline && outline.includes("oklch")) {
              el.style.setProperty(
                "outline-color",
                "#94a3b8",
                "important"
              );
            }

            /*
             * Box shadow
             */

            const shadow =
              computed.getPropertyValue("box-shadow");

            if (shadow && shadow.includes("oklch")) {
              el.style.setProperty(
                "box-shadow",
                "none",
                "important"
              );
            }

            /*
             * Text decoration
             */

            const decoration =
              computed.getPropertyValue(
                "text-decoration-color"
              );

            if (
              decoration &&
              decoration.includes("oklch")
            ) {
              el.style.setProperty(
                "text-decoration-color",
                "#334155",
                "important"
              );
            }
          });
        },
      });

      /*
       * Convert canvas to image.
       */

      const imgData = canvas.toDataURL(
        "image/jpeg",
        0.95
      );

      /*
       * Create A4 PDF.
       */

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = 210;
      const pageHeight = 297;

      const margin = 5;

      const contentWidth =
        pageWidth - margin * 2;

      const contentHeight =
        (canvas.height * contentWidth) /
        canvas.width;

      /*
       * We use the whole captured document and
       * automatically create additional A4 pages
       * when required.
       */

      let remainingHeight = contentHeight;

      let position = margin;

      /*
       * First page
       */

      pdf.addImage(
        imgData,
        "JPEG",
        margin,
        position,
        contentWidth,
        contentHeight
      );

      remainingHeight -=
        pageHeight - margin * 2;

      /*
       * More pages
       */

      while (remainingHeight > 0) {
        pdf.addPage();

        position =
          margin -
          (contentHeight -
            remainingHeight);

        pdf.addImage(
          imgData,
          "JPEG",
          margin,
          position,
          contentWidth,
          contentHeight
        );

        remainingHeight -=
          pageHeight - margin * 2;
      }

      /*
       * Direct download.
       */

      pdf.save(
        `Ajeer-Permit-${permit.id}.pdf`
      );
    } catch (error) {
      console.error(
        "PDF download error:",
        error
      );

      alert(
        "PDF download failed. Please try again."
      );
    } finally {
      setDownloading(false);
    }
  };

  /* ---------- Loading ---------- */

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ajeer-bg">
        <p className="animate-pulse text-[14px] text-slate-500">
          Loading permit notice…
        </p>
      </div>
    );
  }

  /* ---------- Missing ---------- */

  if (state === "missing" || !permit) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ajeer-bg px-6 text-center">
        <p className="text-[18px] font-bold text-ajeer-ink">
          Permit not found
        </p>

        <Link
          href="/admin"
          className="rounded-md bg-ajeer-navy px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-ajeer-navy-dark"
        >
          Back to Management
        </Link>
      </div>
    );
  }

  /* ---------- Main ---------- */

  return (
    <div className="min-h-screen bg-ajeer-bg py-6 print:bg-white print:py-0">
      <div className="mx-auto w-full max-w-[820px] px-4 sm:px-6 print:max-w-none print:px-0">

        {/* Toolbar */}

        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">

          {/* Back */}

          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-[14px] font-semibold text-ajeer-ink transition hover:border-ajeer-navy/40 hover:bg-slate-50"
          >
            ← Back to Management
          </Link>

          {/* Buttons */}

          <div className="flex items-center gap-2">

            {/* Download */}

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-2.5 text-[14px] font-semibold text-ajeer-ink shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {downloading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />

                  Downloading...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-[17px] w-[17px]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"
                    />
                  </svg>

                  Download
                </>
              )}
            </button>

            {/* Print */}

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-md bg-ajeer-navy px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-ajeer-navy-dark"
            >
              <PrintIcon className="h-[17px] w-[17px]" />

              Print
            </button>
          </div>
        </div>

        {/* Paper */}

        <article
          ref={printRef}
          data-pdf-content="true"
          dir="rtl"
          className="font-ar mt-5 bg-white p-6 shadow-[0_10px_30px_rgba(16,24,40,0.10)] ring-1 ring-slate-200 sm:p-10 print:mt-0 print:p-0 print:shadow-none print:ring-0"
        >

          {/* Header */}

          <header
            dir="ltr"
            className="flex items-center justify-between border border-slate-300 p-2"
          >

            {/* QR */}

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

            {/* Title + Logos */}

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

          {/* Intro */}

          <p className="mt-8 text-justify text-[12px] leading-[24px] text-slate-700">
            نشعركم أنه تم التعاقد من قبلنا كجهة مقدمة للخدمة مع الجهة المستفيدة من
            الخدمة حسب المعلومات المبينة أدناه، وذلك تم تسجيل معلومات العقد لتكون
            بحوزة العامل لإثبات عدم مخالفته لنظام العمل ولتقديمها إلى من يهمه الأمر
            من الجهات المختصة عند طلبها للتحقق من صحة تواجده في مكان تقديم الخدمة.
          </p>

          {/* Tables */}

          <div className="mt-6 space-y-3">

            {/* Laborer */}

            <DocTable title="بيانات العامل  Laborer Information">

              <DocRow
                label1={{
                  ar: "اسم العامل",
                  en: "Laborer Name",
                }}
                value1={v(permit.employeeName)}
                label2={{
                  ar: "المهنة",
                  en: "Occupation",
                }}
                value2={v(permit.occupation)}
              />

              <DocRow
                label1={{
                  ar: "رقم الهوية / الإقامة",
                  en: "ID Number",
                }}
                value1={v(permit.idNumber)}
                ltr1
                label2={{
                  ar: "الجنسية",
                  en: "Nationality",
                }}
                value2={v(permit.nationality)}
              />

            </DocTable>

            {/* Provider */}

            <DocTable title="بيانات مقدم الخدمة  Provider Information">

              <DocRow
                label1={{
                  ar: "المنشأة المقدمة للخدمة",
                  en: "Provider Establishment",
                }}
                value1={v(permit.provider.name)}
                label2={{
                  ar: "رقم المنشأة في وزارة الموارد البشرية والتنمية الاجتماعية",
                  en: "Establishment Number",
                }}
                value2={v(permit.provider.number)}
                ltr2
              />

            </DocTable>

            {/* Beneficiary */}

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

            {/* Permit */}

            <DocTable title="بيانات التصريح  Permit Information">

              <DocRow
                label1={{
                  ar: "تاريخ بداية التصريح",
                  en: "Permit Start Date",
                }}
                value1={v(permit.startDate)}
                ltr1
                label2={{
                  ar: "تاريخ نهاية التصريح",
                  en: "Permit End Date",
                }}
                value2={v(permit.endDate)}
                ltr2
              />

            </DocTable>

          </div>

          {/* Declarations */}

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
