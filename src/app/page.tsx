"use client";

import { useState } from "react";
import RoleSelect from "@/components/RoleSelect";
import ChampionGrid from "@/components/ChampionGrid";
import MatchupResult from "@/components/MatchupResult";

export type Role = "top" | "jungle" | "mid" | "bot" | "support";

export interface Champion {
  id: string;
  key: string;
  name: string;
  image: string;
}

type Step = "role" | "your-champ" | "enemy-champ" | "result";

const ROLE_LABELS: Record<Role, string> = {
  top: "Top", jungle: "Jungle", mid: "Mid", bot: "Bot / ADC", support: "Support",
};

export default function Home() {
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<Role>("mid");
  const [yourChamp, setYourChamp] = useState<Champion | null>(null);
  const [enemyChamp, setEnemyChamp] = useState<Champion | null>(null);

  const handleReset = () => { setStep("role"); setYourChamp(null); setEnemyChamp(null); };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b bg-[hsl(240_10%_3.9%/0.9)] backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
          <button onClick={handleReset} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-[var(--gold)] font-bold text-sm tracking-tight">⚔ LoLMatchup</span>
          </button>

          {/* Steps indicator */}
          {step !== "role" && step !== "result" && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
              <StepDot label={ROLE_LABELS[role]} done />
              <span className="text-[hsl(var(--muted))]">›</span>
              <StepDot label="Ton champion" done={step === "enemy-champ"} active={step === "your-champ"} />
              <span className="text-[hsl(var(--muted))]">›</span>
              <StepDot label="Ennemi" active={step === "enemy-champ"} />
            </div>
          )}

          <span className="badge badge-outline text-[10px]">Patch 16.6</span>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {step === "role" && <RoleSelect onSelect={(r) => { setRole(r); setStep("your-champ"); }} />}

        {step === "your-champ" && (
          <ChampionGrid
            title="Ton champion"
            subtitle={`Rôle sélectionné : ${ROLE_LABELS[role]}`}
            onSelect={(c) => { setYourChamp(c); setStep("enemy-champ"); }}
            onBack={() => setStep("role")}
          />
        )}

        {step === "enemy-champ" && yourChamp && (
          <ChampionGrid
            title={`Contre qui tu joues ${yourChamp.name} ?`}
            subtitle="Choisis le champion adverse"
            onSelect={(c) => { setEnemyChamp(c); setStep("result"); }}
            onBack={() => setStep("your-champ")}
            excludeId={yourChamp.id}
          />
        )}

        {step === "result" && yourChamp && enemyChamp && (
          <MatchupResult
            yourChamp={yourChamp}
            enemyChamp={enemyChamp}
            role={role}
            onReset={handleReset}
          />
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t">
        <div className="max-w-5xl mx-auto px-4 h-10 flex items-center justify-between">
          <span className="text-[11px] text-[hsl(var(--muted-foreground))]">Non affilié à Riot Games</span>
          <span className="text-[11px] text-[hsl(var(--muted-foreground))]">Lolalytics · Groq LLaMA 3.3 70B</span>
        </div>
      </footer>
    </div>
  );
}

function StepDot({ label, done, active }: { label: string; done?: boolean; active?: boolean }) {
  return (
    <span className={
      active ? "text-[var(--gold)]" :
      done ? "text-[var(--green)]" :
      "text-[hsl(var(--muted-foreground))]"
    }>
      {done && !active ? "✓ " : ""}{label}
    </span>
  );
}
