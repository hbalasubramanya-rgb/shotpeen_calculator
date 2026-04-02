import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const applicationLinks = [
  {
    label: "Unit Converter",
    href: "https://defenseengineeringunitconverter.vercel.app/?category=force&value=100&from=kn&to=lbf&precision=2",
  },
  {
    label: "Supplier Scorecard",
    href: "https://suplier-performance-scorecard-gener.vercel.app/",
  },
  {
    label: "Wire Calculator",
    href: "https://cw-wire-calc.vercel.app/",
  },
  {
    label: "Earned Value Management",
    href: "https://earned-value-management.vercel.app/",
  },
  {
    label: "Stack Calculator",
    href: "https://cw-stack-calc.vercel.app/",
  },
  {
    label: "Reliability Calculator",
    href: "https://cw-relicalc.vercel.app/",
  },
] as const;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CW Peen Calculator",
  description:
    "Almen intensity and process parameter calculator for Curtiss-Wright Surface Technologies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-950 text-slate-100">
        <aside className="hidden h-screen w-72 border-r border-slate-800/80 bg-slate-950/95 lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:flex-col">
          <div className="border-b border-slate-800/80 px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">
              CWST Tools
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
              Application Suite
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Open any deployed engineering calculator from one shared navigation panel.
            </p>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
            {applicationLinks.map((application) => (
              <a
                key={application.label}
                href={application.href}
                className="block rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:bg-cyan-400/10 hover:text-white"
              >
                {application.label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="lg:pl-72">
          <nav className="border-b border-slate-800/80 bg-slate-950/95 px-4 py-4 lg:hidden">
            <div className="mx-auto max-w-7xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
                CWST Tools
              </p>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {applicationLinks.map((application) => (
                  <a
                    key={application.label}
                    href={application.href}
                    className="shrink-0 rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-medium whitespace-nowrap text-slate-200 transition hover:border-cyan-400/50 hover:bg-cyan-400/10 hover:text-white"
                  >
                    {application.label}
                  </a>
                ))}
              </div>
            </div>
          </nav>

          {children}
        </div>
      </body>
    </html>
  );
}
