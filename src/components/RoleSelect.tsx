"use client";

import { Role } from "@/app/page";

const ROLES: { id: Role; label: string; icon: string; desc: string; color: string }[] = [
  { id: "top",     label: "Top",       icon: "🛡️", desc: "Tanks & Bruisers",  color: "#8B5CF6" },
  { id: "jungle",  label: "Jungle",    icon: "🌿", desc: "Junglers & Gankers", color: "#22C55E" },
  { id: "mid",     label: "Mid",       icon: "⚡", desc: "Mages & Assassins",  color: "#0BC4E3" },
  { id: "bot",     label: "Bot / ADC", icon: "🏹", desc: "Marksmen & Carries", color: "#F59E0B" },
  { id: "support", label: "Support",   icon: "💫", desc: "Enchanters & Tanks", color: "#EC4899" },
];

export default function RoleSelect({ onSelect }: { onSelect: (r: Role) => void }) {
  return (
    <div className="flex flex-col items-center py-10">

      {/* Hero */}
      <div className="text-center mb-12 relative">
        {/* Glow blob */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#C8A847] opacity-5 blur-3xl rounded-full pointer-events-none" />

        <div className="badge badge-gold mb-5 mx-auto">
          <span>⚔</span> IA · Lolalytics · Patch Actuel
        </div>

        <h1
          className="text-5xl sm:text-6xl font-black text-white mb-4 leading-tight"
          style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '-0.01em' }}
        >
          Guide <span className="text-[#C8A847] text-glow-gold">Matchup</span>
        </h1>

        <p className="text-[#8A9BB5] text-base max-w-md mx-auto leading-relaxed">
          Builds Lolalytics en temps réel · Analyse IA par phase de jeu · 172 champions
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 w-full max-w-2xl mb-10">
        <div className="gold-divider flex-1" />
        <span className="text-[#C8A847] text-xs font-semibold tracking-widest uppercase">Sélectionne ton rôle</span>
        <div className="gold-divider flex-1" />
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 w-full max-w-3xl">
        {ROLES.map((role) => (
          <button
            key={role.id}
            onClick={() => onSelect(role.id)}
            className="role-card glass-card p-5 flex flex-col items-center gap-3 text-center cursor-pointer"
          >
            {/* Icon with glow */}
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl relative"
              style={{ background: `${role.color}12`, boxShadow: `0 0 20px ${role.color}20` }}
            >
              {role.icon}
            </div>

            <div>
              <div
                className="font-bold text-white text-sm mb-0.5"
                style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.05em' }}
              >
                {role.label}
              </div>
              <div className="text-[#3A4A60] text-[11px]">{role.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-14 grid grid-cols-3 gap-6 max-w-md w-full">
        {[
          { value: "172",     label: "Champions" },
          { value: "Emeral+", label: "Tier Data" },
          { value: "Live",    label: "Patch Data" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4 text-center">
            <div className="stat-counter">{s.value}</div>
            <div className="text-[#3A4A60] text-xs mt-1 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
