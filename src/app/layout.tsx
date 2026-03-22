import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LoL Matchup Guide — Builds & Stratégies IA",
  description:
    "Analyse IA de vos matchups League of Legends. Builds à jour patch actuel depuis Lolalytics, stratégies early/mid/late game, capacités adverses.",
  openGraph: {
    title: "LoL Matchup Guide",
    description: "Builds & analyses IA pour chaque matchup LoL",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#010A13]">{children}</body>
    </html>
  );
}
