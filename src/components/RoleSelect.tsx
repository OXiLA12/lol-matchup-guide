"use client";

import { Role } from "@/app/page";

const ROLES: { id: Role; label: string; emoji: string; desc: string }[] = [
  { id: "top",     label: "Top",       emoji: "🛡️", desc: "Tanks & Bruisers"   },
  { id: "jungle",  label: "Jungle",    emoji: "🌿", desc: "Junglers & Gankers"  },
  { id: "mid",     label: "Mid",       emoji: "⚡", desc: "Mages & Assassins"   },
  { id: "bot",     label: "Bot / ADC", emoji: "🏹", desc: "Marksmen & Carries"  },
  { id: "support", label: "Support",   emoji: "💫", desc: "Enchanters & Engage" },
];

export default function RoleSelect({ onSelect }: { onSelect: (r: Role) => void }) {
  return (
    <div className="fade-up flex flex-col items-center py-16 gap-10">

      {/* Hero */}
      <div className="text-center space-y-3 max-w-lg">
        <div className="flex justify-center">
          <span className="badge badge-gold">⚔ Builds · IA · Patch Actuel</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
          Guide Matchup
          <span className="text-[var(--gold)]"> LoL</span>
        </h1>

        <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
          Builds Lolalytics temps réel · Analyse IA par phase de jeu · 172 champions
        </p>
      </div>

      {/* Role selection */}
      <div className="w-full max-w-2xl space-y-3">
        <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider text-center">
          Sélectionne ton rôle
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => onSelect(role.id)}
              className="role-card card card-hover p-4 flex flex-col items-center gap-2.5 text-center"
            >
              <span className="text-2xl leading-none">{role.emoji}</span>
              <div>
                <div className="text-sm font-medium text-white">{role.label}</div>
                <div className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">{role.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="divider-gold w-full max-w-xs" />
      <div className="flex items-center gap-8 text-center">
        {[
          { n: "172",     l: "Champions" },
          { n: "Emeral+", l: "Tier data" },
          { n: "16.6.1",  l: "Patch" },
        ].map((s) => (
          <div key={s.l}>
            <div className="text-base font-semibold text-[var(--gold)]">{s.n}</div>
            <div className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
