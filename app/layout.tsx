import "./globals.css";
import { Inter, Noto_Kufi_Arabic } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoKufi = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-kufi",
  display: "swap",
});

export const metadata = {
  title: "Ajeer HR Solutions Permit",
  description:
    "Ajeer HR Solutions Permit — verify permit information, status and beneficiary establishment details.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={`${inter.variable} ${notoKufi.variable}`}>{children}</body>
    </html>
  );
}
