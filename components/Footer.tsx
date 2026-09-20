import { AjeerLogo, GlobeIcon, MhrsdLogo, TakamolLogo } from "./Logos";
import type { Strings } from "../lib/i18n";

type Props = {
  t: Strings;
  onToggleLang: () => void;
};

export default function Footer({ t, onToggleLang }: Props) {
  return (
    <footer className="w-full border-t border-slate-200/70 bg-white">
      <div className="mx-auto flex w-full max-w-[1880px] flex-col items-center gap-8 px-5 py-7 sm:px-8 lg:flex-row lg:justify-between lg:gap-6">
        <div className="shrink-0">
          <AjeerLogo className="h-11 w-auto" />
        </div>

        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-12 lg:gap-16">
          <a href="#privacy" className="text-[15px] text-slate-600 transition hover:text-ajeer-navy">
            {t.privacyPolicy}
          </a>
          <a href="#terms" className="text-[15px] text-slate-600 transition hover:text-ajeer-navy">
            {t.terms}
          </a>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={onToggleLang}
              className="inline-flex items-center gap-2 text-[15px] text-slate-600 transition hover:text-ajeer-teal"
              aria-label="Switch language"
            >
              <span className={t.dir === "ltr" ? "font-ar" : ""}>{t.switchLang}</span>
              <GlobeIcon className="h-[18px] w-[18px]" />
            </button>
            <span className="text-[14px] text-slate-500">{t.copyright}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-7">
          <MhrsdLogo className="h-10 w-auto" />
          <span className="h-8 w-px bg-slate-200" />
          <TakamolLogo className="h-10 w-auto" />
        </div>
      </div>
    </footer>
  );
}
