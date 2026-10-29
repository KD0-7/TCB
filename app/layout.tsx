import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Project Spider-Sense | Dual-Phase Task Management & Balance AI',
  description: 'A Spider-Man themed work-life balance task manager with Peter Parker (Life) and Spider-Man (Work) dual phases powered by GenAI Spider-Sense monitoring.',
  keywords: ['Spider-Man', 'Task Manager', 'Work-Life Balance', 'GenAI', 'Spider-Sense', 'Productivity', 'Peter Parker'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🕷️</text></svg>" />
      </head>
      <body className="min-h-screen transition-colors duration-500 font-sans selection:bg-red-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
