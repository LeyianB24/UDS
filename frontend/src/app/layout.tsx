import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Sidebar } from "@/components/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex bg-slate-950 text-slate-50 font-sans">
        <Sidebar aria-label="Main Navigation" />
        <main className="flex-1 ml-64 min-h-screen transition-all duration-300">
          <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
            <h1 className="text-xl font-bold tracking-tight">Main Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold">Admin Panel</span>
                <span className="text-[10px] text-slate-400">System Administrator</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold">
                A
              </div>
            </div>
          </header>
          <div className="p-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
