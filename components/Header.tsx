"use client";

import { useEffect, useState } from "react";
import { AjeerLogo, GlobeIcon } from "./Logos";
import type { Strings } from "../lib/i18n";

type Props = {
  t: Strings;
  onToggleLang: () => void;
};

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export default function Header({ t, onToggleLang }: Props) {
  const [open, setOpen] = useState(false);

  // lock page scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  const langToggle = (
    <span className="inline-flex items-center gap-2">
      <span className={t.dir === "ltr" ? "font-ar" : ""}>{t.switchLang}</span>
      <GlobeIcon className="h-[18px] w-[18px]" />
    </span>
  );

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/70 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[76px] w-full max-w-[1880px] items-center justify-between gap-4 px-5 sm:px-8">
        {/* mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="-ms-2 rounded-md p-2 text-ajeer-navy transition hover:bg-slate-100 md:hidden"
        >
          <MenuIcon />
        </button>

        {/* desktop nav */}
        <nav className="hidden items-center gap-4 sm:gap-8 md:flex">
          <a
            href="https://ajeer.qiwa.sa/landing"
            className="inline-flex items-center justify-center rounded-md bg-ajeer-navy px-4 py-2.5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-ajeer-navy-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-ajeer-navy/40 focus-visible:ring-offset-2"
          >
            {t.registerNow}
          </a>

          <a
            href="#signin"
            className="text-[15px] text-slate-600 transition hover:text-ajeer-navy"
          >
            {t.signIn}
          </a>

          <a
            href="#knowledge"
            className="text-[15px] text-slate-600 transition hover:text-ajeer-navy"
          >
            {t.knowledgeCenter}
          </a>

          <button
            type="button"
            onClick={onToggleLang}
            className="inline-flex items-center gap-2 text-[15px] text-slate-600 transition hover:text-ajeer-teal"
            aria-label="Switch language"
          >
            {langToggle}
          </button>
        </nav>

        <a href="#top" className="shrink-0" aria-label="Ajeer home">
          <AjeerLogo className="h-11 w-auto" />
        </a>
      </div>

      {/* fullscreen mobile menu */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white md:hidden">
          <div className="flex h-[76px] items-center justify-between px-5 sm:px-8">
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="-ms-2 rounded-md p-2 text-ajeer-navy transition hover:bg-slate-100"
            >
              <MenuIcon />
            </button>
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="-me-2 rounded-md p-2 text-ajeer-navy transition hover:bg-slate-100"
            >
              <CloseIcon />
            </button>
          </div>

          <nav className="flex flex-1 flex-col items-center justify-center gap-9 px-6 pb-28">
            <button
              type="button"
              onClick={onToggleLang}
              className="animate-fade-up inline-flex items-center gap-2 text-[19px] text-slate-600 transition hover:text-ajeer-teal"
              style={{ animationDelay: "60ms" }}
              aria-label="Switch language"
            >
              {langToggle}
            </button>

            <a
              href="#knowledge"
              onClick={close}
              className="animate-fade-up text-[19px] text-slate-600 transition hover:text-ajeer-navy"
              style={{ animationDelay: "140ms" }}
            >
              {t.knowledgeCenter}
            </a>

            <a
              href="#signin"
              onClick={close}
              className="animate-fade-up text-[19px] text-slate-600 transition hover:text-ajeer-navy"
              style={{ animationDelay: "220ms" }}
            >
              {t.signIn}
            </a>

            <a
              href="https://ajeer.qiwa.sa/landing"
              onClick={close}
              className="animate-fade-up mt-2 inline-flex items-center justify-center rounded-md bg-ajeer-navy px-10 py-3 text-[16px] font-semibold text-white shadow-[0_8px_20px_rgba(27,42,99,0.22)] transition hover:bg-ajeer-navy-dark"
              style={{ animationDelay: "300ms" }}
            >
              {t.registerNow}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}