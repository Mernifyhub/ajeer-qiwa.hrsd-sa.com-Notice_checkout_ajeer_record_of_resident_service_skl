type LogoProps = { className?: string };

/** Ajeer wordmark: Arabic "أجير" in navy with teal swoosh + latin AJEER lockup */
export function AjeerLogo({ className = "h-10" }: LogoProps) {
  return (
    <svg viewBox="0 0 130 58" className={className} role="img" aria-label="Ajeer">
      <path
        d="M26 15 C55 4, 82 6, 106 16"
        stroke="#00a88e"
        strokeWidth="3.4"
        strokeLinecap="round"
        fill="none"
      />
      <text
        x="65"
        y="40"
        textAnchor="middle"
        fontFamily="'Noto Kufi Arabic', sans-serif"
        fontSize="30"
        fontWeight="700"
        fill="#1b2a63"
      >
        أجير
      </text>
      <text
        x="65"
        y="54"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontSize="8.5"
        fontWeight="600"
        letterSpacing="4"
        fill="#1b2a63"
      >
        AJEER
      </text>
    </svg>
  );
}

/** Ministry of Human Resources and Social Development (simplified emblem + wordmark) */
/** Ministry of Human Resources and Social Development */
/** Ministry of Human Resources and Social Development */
export function MhrsdLogo({ className = "h-9" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Arabic wordmark */}
      <div dir="rtl" className="flex flex-col items-end leading-tight">
        <span className="text-[11px] font-bold text-[#0f7d4f] whitespace-nowrap">
          الموارد البشرية
        </span>
        <span className="text-[11px] font-bold text-[#0f7d4f] whitespace-nowrap">
          والتنمية الاجتماعية
        </span>
      </div>

      {/* Star mark image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/mhrsd-logo.png"
        alt="MHRSD"
        className="h-full w-auto object-contain"
      />
    </div>
  );
}

/** Takamol Holding wordmark */
export function TakamolLogo({ className = "h-9" }: LogoProps) {
  return (
    <svg viewBox="0 0 120 54" className={className} role="img" aria-label="Takamol">
      <text
        x="60"
        y="32"
        textAnchor="middle"
        fontFamily="'Noto Kufi Arabic', sans-serif"
        fontSize="27"
        fontWeight="700"
        fill="#1b2a63"
      >
        تكامل
      </text>
      <text
        x="60"
        y="48"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontSize="10"
        fontWeight="500"
        letterSpacing="0.5"
        fill="#5a6486"
      >
        Takamol
      </text>
    </svg>
  );
}

export function GlobeIcon({ className = "h-4 w-4" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3.6 9h16.8M3.6 15h16.8" />
      <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z" />
    </svg>
  );
}

export function LinkIcon({ className = "h-4 w-4" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
    </svg>
  );
}

export function CheckIcon({ className = "h-4 w-4" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

export function PrintIcon({ className = "h-4 w-4" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9V3h12v6" />
      <rect x="3" y="9" width="18" height="8" rx="2" />
      <path d="M6 15h12v6H6z" />
    </svg>
  );
}
