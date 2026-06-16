import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ClearGuide - Accessible Product Manuals",
  description: "Create and share accessible product manuals with AI-powered support",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth bg-white dark:bg-slate-950">
      <head>
        <style>{`
          :root {
            --color-background: 255, 255, 255;
            --color-foreground: 0, 0, 0;
            --color-accent: 22, 163, 74;
            --color-muted: 107, 114, 128;
          }
          
          @media (prefers-color-scheme: dark) {
            :root {
              --color-background: 3, 7, 18;
              --color-foreground: 248, 250, 252;
              --color-accent: 34, 197, 94;
              --color-muted: 148, 163, 184;
            }
          }
        `}</style>
      </head>
      <body className={`${inter.className} bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50`}>
        {children}
      </body>
    </html>
  );
}
