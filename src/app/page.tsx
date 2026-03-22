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

export interface MatchupData {
  yourChamp: Champion;
  enemyChamp: Champion;
  role: Role;
}

type Step = "role" | "your-champ" | "enemy-champ" | "result";

export default function Home() {
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<Role>("mid");
  const [yourChamp, setYourChamp] = useState<Champion | null>(null);
  const [enemyChamp, setEnemyChamp] = useState<Champion | null>(null);

  function handleRoleSelect(r: Role) {
    setRole(r);
    setStep("your-champ");
  }

  function handleYourChamp(c: Champion) {
    setYourChamp(c);
    setStep("enemy-champ");
  }

  function handleEnemyChamp(c: Champion) {
    setEnemyChamp(c);
    setStep("result");
  }

  function handleReset() {
    setStep("role");
    setYourChamp(null);
    setEnemyChamp(null);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[#1E3A5F] bg-[#030E17]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={handleReset} className="flex items-center gap-3 hover:opacity-80 transition">
            <div className="w-8 h-8 bg-[#C8A847] rounded-sm flex items-center justify-center text-[#010A13] font-black text-sm">
              ⚔
            </div>
            <span className="text-[#C8A847] font-bold text-lg tracking-wide">
              LoL Matchup Guide
            </span>
          </button>
          <div className="text-xs text-gray-500 hidden sm:block">
            Builds Lolalytics · IA Groq · Patch Actuel
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      {step !== "role" && step !== "result" && (
        <div className="max-w-6xl mx-auto px-4 pt-4 flex items-center gap-2 text-xs text-gray-500">
          <BreadcrumbStep label="Rôle" done={true} active={false} />
          <span>›</span>
          <BreadcrumbStep label="Ton champion" done={step === "enemy-champ"} active={step === "your-champ"} />
          <span>›</span>
          <BreadcrumbStep label="Champion ennemi" done={false} active={step === "enemy-champ"} />
        </div>
      )}

      {/* Main */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {step === "role" && (
          <RoleSelect onSelect={handleRoleSelect} />
        )}

        {step === "your-champ" && (
          <ChampionGrid
            role={role}
            title="Quel champion joues-tu ?"
            subtitle={`Rôle sélectionné : ${roleName(role)}`}
            onSelect={handleYourChamp}
            onBack={() => setStep("role")}
          />
        )}

        {step === "enemy-champ" && yourChamp && (
          <ChampionGrid
            role={role}
            title={`Contre qui joues-tu ${yourChamp.name} ?`}
            subtitle="Sélectionne le champion adverse"
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
      <footer className="border-t border-[#1E3A5F] py-4 text-center text-xs text-gray-600">
        Non affilié à Riot Games · Données : Lolalytics (patch actuel) · IA : Groq LLaMA 3.3 70B
      </footer>
    </div>
  );
}

function BreadcrumbStep({ label, done, active }: { label: string; done: boolean; active: boolean }) {
  return (
    <span className={active ? "text-[#C8A847]" : done ? "text-green-500" : "text-gray-600"}>
      {done ? "✓ " : ""}{label}
    </span>
  );
}

function roleName(r: Role) {
  return { top: "Top", jungle: "Jungle", mid: "Mid", bot: "Bot / ADC", support: "Support" }[r];
}
