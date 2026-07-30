"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { StatusBadge, type StatusTone } from "@/components/PermitCard";
import { CheckIcon } from "@/components/Logos";
import { strings, type Lang, type Strings } from "@/lib/i18n";
import { STATUSES, type Permit, type PermitStatus } from "@/lib/types";

const STATUS_TONE: Record<PermitStatus, StatusTone> = {
  Active: "green",
  Sari: "green",
  Expired: "red",
  Pending: "amber",
};

const EMPTY_FORM = {
  employeeName: "",
  occupation: "",
  nationality: "",
  idNumber: "",
  status: "Active" as PermitStatus,
  startDate: "",
  endDate: "",
  beneficiaryName: "",
  beneficiaryNumber: "",
  providerName: "",
  providerNumber: "",
};

type FormState = typeof EMPTY_FORM;
type Modal = { mode: "create" } | { mode: "edit"; id: string } | null;

const INPUT =
  "w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-[14px] text-slate-700 outline-none transition focus:border-ajeer-navy focus:ring-2 focus:ring-ajeer-navy/20";

const lbl = (s: string) => s.replace(/:$/, "");

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function Field({
  label,
  children,
  full = false,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-[13px] font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}

export default function AdminPanel() {
  const [lang, setLang] = useState<Lang>("en");
  const t: Strings = useMemo(() => strings[lang], [lang]);
  const toggleLang = useCallback(() => setLang((v) => (v === "en" ? "ar" : "en")), []);

  const [permits, setPermits] = useState<Permit[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<Modal>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = t.dir;
    document.title = t.manage;
  }, [lang, t]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const res = await fetch("/api/permits", { cache: "no-store" });
      if (!res.ok) throw new Error();
      setPermits(await res.json());
    } catch {
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // auto-clear temporary states
  useEffect(() => {
    if (!confirmId) return;
    const id = window.setTimeout(() => setConfirmId(null), 3000);
    return () => window.clearTimeout(id);
  }, [confirmId]);

  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(null), 2800);
    return () => window.clearTimeout(id);
  }, [notice]);

  // close modal on Escape
  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return permits;
    return permits.filter((p) =>
      [p.id, p.employeeName, p.beneficiary.name, p.beneficiary.number, p.provider.name, p.provider.number]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [permits, query]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setModal({ mode: "create" });
  };

  const openEdit = (p: Permit) => {
    setForm({
      employeeName: p.employeeName,
      occupation: p.occupation ?? "",
      nationality: p.nationality ?? "",
      idNumber: p.idNumber ?? "",
      status: p.status,
      startDate: p.startDate,
      endDate: p.endDate,
      beneficiaryName: p.beneficiary.name,
      beneficiaryNumber: p.beneficiary.number,
      providerName: p.provider.name,
      providerNumber: p.provider.number,
    });
    setModal({ mode: "edit", id: p.id });
  };

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const payload = {
      employeeName: form.employeeName,
      occupation: form.occupation,
      nationality: form.nationality,
      idNumber: form.idNumber,
      status: form.status,
      startDate: form.startDate,
      endDate: form.endDate,
      beneficiary: { name: form.beneficiaryName, number: form.beneficiaryNumber },
      provider: { name: form.providerName, number: form.providerNumber },
    };
    try {
      const isEdit = modal?.mode === "edit";
      const res = await fetch(isEdit ? `/api/permits/${encodeURIComponent(modal.id)}` : "/api/permits", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      const saved: Permit = await res.json();
      setNotice(isEdit ? t.updatedMsg : t.createdTpl.replace("{id}", saved.id));
      setModal(null);
      await load();
    } catch {
      setNotice(t.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    setConfirmId(null);
    try {
      const res = await fetch(`/api/permits/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setNotice(t.deletedMsg);
      await load();
    } catch {
      setNotice(t.saveFailed);
    }
  };

  const actionBtn =
    "inline-flex items-center rounded-md px-3 py-1.5 text-[13px] font-medium transition focus:outline-none focus-visible:ring-2";

  return (
    <div dir={t.dir} className={`flex min-h-screen flex-col bg-ajeer-bg ${lang === "ar" ? "font-ar" : ""}`}>
      <Header t={t} onToggleLang={toggleLang} />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1245px] px-5 pb-16 pt-8 sm:px-8">
          {/* title row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-[26px] font-bold tracking-tight text-ajeer-ink sm:text-[28px]">{t.manage}</h1>
              <p className="mt-1 text-[14px] text-slate-500">{t.manageSubtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-[14px] font-semibold text-ajeer-ink transition hover:border-ajeer-navy/40 hover:bg-slate-50"
              >
                {t.publicPage}
              </Link>
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-md bg-ajeer-navy px-4 py-2.5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-ajeer-navy-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-ajeer-navy/40 focus-visible:ring-offset-2"
              >
                <PlusIcon />
                {t.addPermit}
              </button>
            </div>
          </div>

          {/* search + count */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-sm">
              <span className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400 ${t.dir === "rtl" ? "right-3.5" : "left-3.5"}`}>
                <SearchIcon />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.search}
                className={`${INPUT} ${t.dir === "rtl" ? "pr-10" : "pl-10"}`}
              />
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-slate-500">
              {t.total}: <span className="font-semibold text-ajeer-navy">{permits.length}</span>
            </span>
          </div>

          {/* table */}
          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <p className="px-6 py-10 text-center text-[14px] text-slate-500">{t.loadingList}</p>
            ) : loadFailed ? (
              <p className="px-6 py-10 text-center text-[14px] text-red-500">{t.loadError}</p>
            ) : filtered.length === 0 ? (
              <p className="px-6 py-10 text-center text-[14px] text-slate-500">{t.emptyState}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-[14px] rtl:text-right">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[13px] text-slate-500">
                      <th className="px-5 py-3.5 font-semibold">{t.colPermitId}</th>
                      <th className="px-5 py-3.5 font-semibold">{t.colEmployee}</th>
                      <th className="px-5 py-3.5 font-semibold">{t.colStatus}</th>
                      <th className="px-5 py-3.5 font-semibold">{t.colPeriod}</th>
                      <th className="px-5 py-3.5 font-semibold">{t.colActions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id} className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70">
                        <td className="px-5 py-4 font-mono text-[13px] font-bold text-ajeer-navy">{p.id}</td>
                        <td className="px-5 py-4 text-slate-700">{p.employeeName}</td>
                        <td className="px-5 py-4">
                          <StatusBadge label={t.statusLabels[p.status]} tone={STATUS_TONE[p.status]} />
                        </td>
                        <td className="px-5 py-4 tabular-nums text-slate-600">
                          <span dir="ltr">{p.startDate} ← {p.endDate}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/notice/${encodeURIComponent(p.id)}`}
                              target="_blank"
                              className={`${actionBtn} border border-slate-300 bg-white text-ajeer-ink hover:border-ajeer-navy/40 hover:bg-slate-50 focus-visible:ring-ajeer-navy/30`}
                            >
                              {t.view}
                            </Link>
                            <button
                              type="button"
                              onClick={() => openEdit(p)}
                              className={`${actionBtn} bg-ajeer-teal/10 text-ajeer-teal hover:bg-ajeer-teal/20 focus-visible:ring-ajeer-teal/40`}
                            >
                              {t.edit}
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(p.id)}
                              className={`${actionBtn} ${
                                confirmId === p.id
                                  ? "bg-red-600 text-white hover:bg-red-700"
                                  : "bg-red-50 text-red-600 hover:bg-red-100"
                              } focus-visible:ring-red-400/50`}
                            >
                              {confirmId === p.id ? t.sure : t.del}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer t={t} onToggleLang={toggleLang} />

      {/* add / edit modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ajeer-ink/40 backdrop-blur-[2px]" onClick={() => setModal(null)} />
          <form
            onSubmit={save}
            className="animate-toast-in relative max-h-[90vh] w-full max-w-[640px] overflow-y-auto rounded-xl bg-white p-6 shadow-[0_24px_60px_rgba(16,24,40,0.25)] sm:p-8"
          >
            <h2 className="text-[20px] font-bold text-ajeer-ink">
              {modal.mode === "edit" ? t.editTitle : t.createTitle}
            </h2>
            {modal.mode === "edit" ? (
              <p className="mt-1.5 text-[13px] text-slate-500">
                {t.permitNumber} <span className="font-mono font-semibold text-ajeer-navy">{modal.id}</span>
              </p>
            ) : (
              <p className="mt-1.5 text-[13px] text-slate-500">{t.permitIdNote}</p>
            )}

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={lbl(t.employeeName)} full>
                <input className={INPUT} value={form.employeeName} onChange={set("employeeName")} required dir="auto" />
              </Field>
              <Field label={lbl(t.occupation)}>
                <input className={INPUT} value={form.occupation} onChange={set("occupation")} dir="auto" />
              </Field>
              <Field label={lbl(t.nationality)}>
                <input className={INPUT} value={form.nationality} onChange={set("nationality")} dir="auto" />
              </Field>
              <Field label={lbl(t.idNumber)}>
                <input className={INPUT} value={form.idNumber} onChange={set("idNumber")} dir="ltr" />
              </Field>
              <Field label={lbl(t.permitStatus)}>
                <select className={INPUT} value={form.status} onChange={set("status")}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {t.statusLabels[s]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={lbl(t.permitStartDate)}>
                <input type="date" className={INPUT} value={form.startDate} onChange={set("startDate")} required />
              </Field>
              <Field label={lbl(t.permitEndDate)}>
                <input type="date" className={INPUT} value={form.endDate} onChange={set("endDate")} required />
              </Field>
            </div>

            <h3 className="mt-7 border-b border-slate-200 pb-2.5 text-[15px] font-bold text-ajeer-ink">
              {t.beneficiaryInfo}
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={lbl(t.establishmentName)}>
                <input className={INPUT} value={form.beneficiaryName} onChange={set("beneficiaryName")} required dir="auto" />
              </Field>
              <Field label={lbl(t.establishmentNumber)}>
                <input className={INPUT} value={form.beneficiaryNumber} onChange={set("beneficiaryNumber")} required dir="ltr" />
              </Field>
            </div>

            <h3 className="mt-7 border-b border-slate-200 pb-2.5 text-[15px] font-bold text-ajeer-ink">
              {t.providerInfo}
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={lbl(t.establishmentName)}>
                <input className={INPUT} value={form.providerName} onChange={set("providerName")} required dir="auto" />
              </Field>
              <Field label={lbl(t.establishmentNumber)}>
                <input className={INPUT} value={form.providerNumber} onChange={set("providerNumber")} required dir="ltr" />
              </Field>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-[14px] font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-ajeer-navy px-6 py-2.5 text-[14px] font-semibold text-white transition hover:bg-ajeer-navy-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? t.saving : modal.mode === "edit" ? t.saveChanges : t.createBtn}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* toast */}
      {notice && (
        <div
          role="status"
          className="animate-toast-in fixed bottom-7 left-1/2 z-[60] -translate-x-1/2 rounded-lg bg-ajeer-ink px-5 py-3 text-[14px] font-medium text-white shadow-[0_14px_32px_rgba(16,24,40,0.28)]"
        >
          <span className="inline-flex items-center gap-2">
            <CheckIcon className="h-4 w-4 text-ajeer-green" />
            {notice}
          </span>
        </div>
      )}
    </div>
  );
}
