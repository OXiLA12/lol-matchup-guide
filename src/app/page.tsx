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

  function handleRoleSelect(r: Role) { setRole(r); setStep("your-champ"); }
  function handleYourChamp(c: Champion) { setYourChamp(c); setStep("enemy-champ"); }
  function handleEnemyChamp(c: Champion) { setEnemyChamp(c); setStep("result"); }
  function handleReset() { setStep("role"); setYourChamp(null); setEnemyChamp(null); }

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[rgba(200,168,71,0.12)] bg-[rgba(6,13,26,0.85)] backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <button onClick={handleReset} className="flex items-center gap-2.5 hover:opacity-90 transition group">
            {/* Logo mark */}
            <div className="relative w-7 h-7 flex items-center justify-center">
              <div className="absolute inset-0 bg-[#C8A847] rounded opacity-10 group-hover:opacity-20 transition" />
              <span className="text-[#C8A847] text-base leading-none">⚔</span>
            </div>
            <div>
              <span className="text-white font-bold text-base tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                LoL<span className="text-[#C8A847]">Matchup</span>
              </span>
            </div>
          </button>

          {/* Breadcrumb */}
          {step !== "role" && step !== "result" && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#3A4A60]">
              <Step label={ROLE_LABELS[role]} done />
              <span className="text-[#1E3A5F]">›</span>
              <Step label="Ton champ" done={step === "enemy-champ"} active={step === "your-champ"} />
              <span className="text-[#1E3A5F]">›</span>
              <Step label="Ennemi" done={false} active={step === "enemy-champ"} />
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="badge badge-gold text-[10px]">Patch Actuel</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {step === "role" && <RoleSelect onSelect={handleRoleSelect} />}
        {step === "your-champ" && (
          <ChampionGrid
            role={role}
            title="Quel champion joues-tu ?"
            subtitle={`Rôle : ${ROLE_LABELS[role]}`}
            onSelect={handleYourChamp}
            onBack={() => setStep("role")}
          />
        )}
        {step === "enemy-champ" && yourChamp && (
          <ChampionGrid
            role={role}
            title={`Contre qui joues-tu ${yourChamp.name} ?`}
            subtitle="Champion ennemi en face"
            onSelect={handleEnemyChamp}
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

      {/* Footer */}
      <footer className="border-t border-[rgba(200,168,71,0.08)] py-5">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[#3A4A60] text-xs">Non affilié à Riot Games</span>
          <span className="text-[#3A4A60] text-xs">Données : Lolalytics · IA : Groq LLaMA 3.3 70B</span>
        </div>
      </footer>
    </div>
  );
}

function Step({ label, done, active }: { label: string; done: boolean; active?: boolean }) {
  return (
    <span className={active ? "text-[#C8A847]" : done ? "text-green-500" : "text-[#3A4A60]"}>
      {done && !active ? "✓ " : ""}{label}
    </span>
  );
}
