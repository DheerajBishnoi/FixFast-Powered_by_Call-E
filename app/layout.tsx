import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FixFast — Autonomous Emergency Trades & Contractor Dispatch Agent',
  description: 'Autonomous goal-driven sequential phone dispatch agent built on CALL-E. Protect properties from catastrophic damage by locking 24/7 plumbers, electricians, and HVAC pros.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070b14] text-slate-100 antialiased selection:bg-amber-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
