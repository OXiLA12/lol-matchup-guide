"use client";

import { Role } from "@/app/page";

const ROLES: { id: Role; label: string; icon: string; desc: string }[] = [
  { id: "top", label: "Top", icon: "🛡️", desc: "Tanks, bruisers, duelistes" },
  { id: "jungle", label: "Jungle", icon: "🌿", desc: "Junglers, gankeurs" },
  { id: "mid", label: "Mid", icon: "⚡", desc: "Mages, assassins" },
  { id: "bot", label: "Bot / ADC", icon: "🏹", desc: "Marksmen, hypercarry" },
  { id: "support", label: "Support", icon: "💫", desc: "Enchanters, engageurs" },
];

export default function RoleSelect({ onSelect }: { onSelect: (r: Role) => void }) {
  return (
    <div className="flex flex-col items-center py-12">
      <h1 className="text-3xl font-bold text-white mb-2 text-center">
        LoL Matchup Guide
      </h1>
      <p className="text-gray-400 mb-2 text-center">
        Builds à jour · Analyse IA · Stratégies par phase
      </p>
      <div className="gold-divider w-48 my-6" />

      <h2 className="text-[#C8A847] font-semibold text-lg mb-8 text-center">
        Sélectionne ton rôle
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 w-full max-w-3xl">
        {ROLES.map((role) => (
          <button
            key={role.id}
            onClick={() => onSelect(role.id)}
            className="flex flex-col items-center gap-2 p-5 rounded-lg border border-[#1E3A5F] bg-[#0A1428] hover:border-[#C8A847] hover:bg-[#0F1E38] transition-all duration-150 group"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform">{role.icon}</span>
            <span className="text-white font-bold">{role.label}</span>
            <span className="text-gray-500 text-xs text-center">{role.desc}</span>
          </button>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-3 gap-8 max-w-lg w-full text-center">
        <Stat value="168" label="Champions" />
        <Stat value="Emerald+" label="Données" />
        <Stat value="Actuel" label="Patch" />
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-[#C8A847] font-bold text-xl">{value}</div>
      <div className="text-gray-500 text-xs mt-1">{label}</div>
    </div>
  );
}
