import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LoL Matchup Guide — Builds & Stratégies IA",
  description:
    "Analyse IA de vos matchups League of Legends. Builds à jour patch actuel depuis Lolalytics, stratégies early/mid/late game.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Rajdhani:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen relative z-10">{children}</body>
    </html>
  );
}
