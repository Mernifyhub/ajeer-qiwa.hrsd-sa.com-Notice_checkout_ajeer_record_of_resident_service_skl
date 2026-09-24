"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { AjeerLogo, MhrsdLogo, PrintIcon } from "@/components/Logos";
import type { Permit } from "@/lib/types";

const DECLARATIONS = [
  "إن العامل حامل هذا التصريح بحمله له يقر ويتعهد بأن البيانات المدونة فيه صحيحة على مسؤوليته الشخصية، وأنه يعمل لدى المنشأة ولحسابها، بموجب رخصة إقامة سارية المفعول، وأتحمل أي تبعات قانونية أو غرامات تترتب على خلاف المذكور أعلاه.",
  "الالتزام والتقيد بأنظمة العمل والعمال وأي أنظمة و لوائح وقرارات أخرى ذات علاقة.",
  "أن الموقع الإلكتروني الخاص بأجير أو القائمين عليه عبارة عن وسيط إلكتروني ما بين الباحثين عن العمل وأصحاب الأعمال فقط وبدون أي التزام قانوني أو غيره على القائمين على موقع أجير.",
  "أي تعديل أو كشط في هذا التصريح يجعله لاغياً.",
];

const v = (s?: string) => (s && s.trim() ? s : "—");

/* ---------- Main Component ---------- */

export default function PermitNotice({ id }: { id: string }) {
  const [permit, setPermit] = useState<Permit | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");
  const [qr, setQr] = useState("");
  const [downloading, setDownloading] = useState(false);
  const printRef = useRef<HTMLElement>(null);

  /* ---------- Fetch Permit ---------- */

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

        /* ---------- QR ---------- */
        const url =
          `https://ajeer-qiwa-hrsd-sa-com-notice-check.vercel.app/` +
          `Notice_checkout_ajeer_record_of_resident_service_skl.php?id=` +
          `${encodeURIComponent(data.id)}`;

        const png = await QRCode.toDataURL(url, {
          width: 480,
          margin: 0,
          errorCorrectionLevel: "M",
          color: { dark: "#000000", light: "#ffffff" },
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

  /* =========================================================
     PDF DOWNLOAD
     ========================================================= */

  const handleDownload = async () => {
    if (!printRef.current || !permit) return;

    try {
      setDownloading(true);
      const element = printRef.current;

      await document.fonts.ready;
      const images = Array.from(element.querySelectorAll("img"));

      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
        })
      );

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 15000,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 5;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      let remainingHeight = contentHeight;
      let position = margin;

      pdf.addImage(imgData, "JPEG", margin, position, contentWidth, contentHeight);
      remainingHeight -= pageHeight - margin * 2;

      while (remainingHeight > 0) {
        pdf.addPage();
        position = margin - (contentHeight - remainingHeight);
        pdf.addImage(imgData, "JPEG", margin, position, contentWidth, contentHeight);
        remainingHeight -= pageHeight - margin * 2;
      }

      pdf.save(`Ajeer-Permit-${permit.id}.pdf`);
    } catch (error) {
      console.error("PDF download error:", error);
      alert("PDF download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  /* ---------- Loading & Missing States ---------- */

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="animate-pulse text-sm text-gray-500">Loading permit notice…</p>
      </div>
    );
  }

  if (state === "missing" || !permit) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center">
        <p className="text-lg font-bold text-gray-800">Permit not found</p>
        <Link
          href="/admin"
          className="rounded-md bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Back to Management
        </Link>
      </div>
    );
  }

  /* ---------- Main View ---------- */

  return (
    <div className="min-h-screen bg-gray-100 py-6 print:bg-white print:py-0">
      <div className="mx-auto w-full max-w-[850px] px-4 sm:px-6 print:max-w-none print:px-0">
        {/* Toolbar */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
          >
            ← Back to Management
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
            >
              {downloading ? "Downloading..." : "Download PDF"}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-md bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
            >
              <PrintIcon className="h-[17px] w-[17px]" />
              Print
            </button>
          </div>
        </div>

        {/* Paper Document */}
        <article
          ref={printRef}
          data-pdf-content="true"
          dir="rtl"
          className="font-ar bg-white p-6 shadow-lg sm:p-10 print:p-0 print:shadow-none min-h-[1050px] flex flex-col"
        >
          {/* Header */}
          <header className="flex items-center justify-between border-b-2 border-gray-200 pb-4">
            <div className="flex flex-col items-center justify-center border border-gray-300 p-1">
              {qr ? (
                <img src={qr} alt="QR" className="h-[80px] w-[80px]" />
              ) : (
                <div className="h-[80px] w-[80px] bg-gray-100" />
              )}
              <span className="mt-1 text-[10px] font-bold text-gray-800 uppercase">
                {permit.id}
              </span>
            </div>

            <h1 className="text-center text-[22px] font-bold text-gray-800">
              تصريح أجير – تعاقد أجير
            </h1>

            <div className="flex items-center gap-3">
              <AjeerLogo className="h-12 w-auto" />
              <MhrsdLogo className="h-14 w-auto" />
            </div>
          </header>

          {/* Intro Paragraph */}
          <p className="mt-6 text-center text-[13px] font-medium leading-[24px] text-gray-700">
            نشعركم أنه تم التعاقد من قبلنا كجهة مقدمة للخدمة مع الجهة المستفيدة من
            الخدمة حسب المعلومات المبينة أدناه، وذلك تم تسجيل
            <br />
            معلومات العقد لتكون بحوزة العامل لإثبات عدم مخالفته لنظام العمل ولتقديمها إلى
            من يهمه الأمر من الجهات المختصة عند طلبها
            <br />
            للتحقق من صحة تواجده في مكان تقديم الخدمة
          </p>

          {/* Combined Tables Container */}
          <div className="mt-6 flex flex-col border border-gray-300 text-[13px]">
            
            {/* Section: Worker Info */}
            <div className="bg-gray-100 py-1.5 text-center font-bold text-gray-800 border-b border-gray-300">
              بيانات العامل
            </div>
            <div className="grid grid-cols-[15%_35%_15%_35%] border-b border-gray-300 bg-white">
              <div className="flex items-center justify-center bg-gray-100 p-2 font-bold text-gray-700 border-l border-gray-300">اسم العامل</div>
              <div className="flex items-center justify-center p-2 font-bold text-gray-900 border-l border-gray-300 uppercase">{v(permit.employeeName)}</div>
              <div className="flex items-center justify-center bg-gray-100 p-2 font-bold text-gray-700 border-l border-gray-300">المهنة</div>
              <div className="flex items-center justify-center p-2 font-bold text-gray-900">{v(permit.occupation)}</div>
            </div>
            <div className="grid grid-cols-[15%_35%_15%_35%] border-b border-gray-300 bg-white">
              <div className="flex items-center justify-center bg-gray-100 p-2 font-bold text-gray-700 border-l border-gray-300">رقم الهوية / الإقامة</div>
              <div dir="ltr" className="flex items-center justify-center p-2 font-bold text-gray-900 border-l border-gray-300">{v(permit.idNumber)}</div>
              <div className="flex items-center justify-center bg-gray-100 p-2 font-bold text-gray-700 border-l border-gray-300">الجنسية</div>
              <div className="flex items-center justify-center p-2 font-bold text-gray-900">{v(permit.nationality)}</div>
            </div>

            {/* Section: Provider Info */}
            <div className="bg-gray-100 py-1.5 text-center font-bold text-gray-800 border-b border-gray-300">
              بيانات مقدم الخدمة
            </div>
            <div className="grid grid-cols-[15%_35%_20%_30%] border-b border-gray-300 bg-white">
              <div className="flex items-center justify-center bg-gray-100 p-2 font-bold text-gray-700 border-l border-gray-300 text-center">المنشأة المقدمة للخدمة</div>
              <div className="flex items-center justify-center p-2 font-bold text-gray-900 border-l border-gray-300 text-center">{v(permit.provider.name)}</div>
              <div className="flex items-center justify-center bg-gray-100 p-2 font-bold text-gray-700 border-l border-gray-300 text-center">رقم المنشأة في وزارة الموارد<br/>البشرية و التنمية الاجتماعية</div>
              <div dir="ltr" className="flex items-center justify-center p-2 font-bold text-gray-900">{v(permit.provider.number)}</div>
            </div>

            {/* Section: Beneficiary Info */}
            <div className="bg-gray-100 py-1.5 text-center font-bold text-gray-800 border-b border-gray-300">
              بيانات المستفيد من الخدمة
            </div>
            <div className="grid grid-cols-[15%_35%_20%_30%] border-b border-gray-300 bg-white">
              <div className="flex items-center justify-center bg-gray-100 p-2 font-bold text-gray-700 border-l border-gray-300 text-center">المنشأة المستفيدة من الخدمة</div>
              <div className="flex items-center justify-center p-2 font-bold text-gray-900 border-l border-gray-300 text-center">{v(permit.beneficiary.name)}</div>
              <div className="flex items-center justify-center bg-gray-100 p-2 font-bold text-gray-700 border-l border-gray-300 text-center">رقم المنشأة في وزارة الموارد<br/>البشرية و التنمية الاجتماعية</div>
              <div dir="ltr" className="flex items-center justify-center p-2 font-bold text-gray-900">{v(permit.beneficiary.number)}</div>
            </div>

            {/* Section: Permit Info */}
            <div className="bg-gray-100 py-1.5 text-center font-bold text-gray-800 border-b border-gray-300">
              بيانات التصريح
            </div>
            <div className="grid grid-cols-[15%_85%] border-b border-gray-300 bg-white">
              <div className="flex items-center justify-center bg-gray-100 p-2 font-bold text-gray-700 border-l border-gray-300">نبذة عن التعاقد</div>
              {/* Fallback to text from image if property doesn't exist in type */}
              <div className="flex items-center justify-center p-2 font-bold text-gray-900">
                {(permit as any).contractBrief || `تعاقد أجير ${permit.beneficiary.name}`}
              </div>
            </div>
            <div className="grid grid-cols-[15%_35%_15%_35%] border-b border-gray-300 bg-white">
              <div className="flex items-center justify-center bg-gray-100 p-2 font-bold text-gray-700 border-l border-gray-300">تاريخ بداية التصريح</div>
              <div dir="ltr" className="flex items-center justify-center p-2 font-bold text-gray-900 border-l border-gray-300">{v(permit.startDate)}</div>
              <div className="flex items-center justify-center bg-gray-100 p-2 font-bold text-gray-700 border-l border-gray-300">تاريخ نهاية التصريح</div>
              <div dir="ltr" className="flex items-center justify-center p-2 font-bold text-gray-900">{v(permit.endDate)}</div>
            </div>
            <div className="grid grid-cols-[15%_85%] bg-white">
              <div className="flex items-center justify-center bg-gray-100 p-2 font-bold text-gray-700 border-l border-gray-300">مواقع العمل</div>
              {/* Fallback to text from image if property doesn't exist in type */}
              <div className="flex items-center justify-center p-2 font-bold text-gray-900">
                 {(permit as any).workLocation || "المنطقة الصناعية، الرياض، السعودية"}
              </div>
            </div>

          </div>

          {/* Declarations */}
          <div className="mt-6 flex-1">
            <h3 className="text-right text-[15px] font-bold text-gray-900">
              إقرارات
            </h3>
            <p className="mt-2 text-[13px] font-bold text-gray-900">
              أقر أنا المنشأة المقدمة للخدمة والموضحة بياناتي أعلاه وأتعهد بـ:
            </p>
            <ul className="mt-1 list-disc space-y-1.5 pe-5 text-[12px] font-medium leading-[22px] text-gray-700 marker:text-gray-800">
              {DECLARATIONS.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <footer className="mt-8 pt-4 text-center text-[12px] font-bold text-gray-600">
            <p>
              للتحقق من صحة هذا التصريح وسريان مفعوله بإمكانك زيارة موقع أجير (https://ajeer.com.sa)
            </p>
            <p className="mt-1">
              * خدمة معتمدة من وزارة الموارد البشرية والتنمية الاجتماعية *
            </p>
          </footer>
        </article>
      </div>
    </div>
  );
}