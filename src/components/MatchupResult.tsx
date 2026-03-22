"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { Champion, Role } from "@/app/page";

interface Props {
  yourChamp: Champion;
  enemyChamp: Champion;
  role: Role;
  onReset: () => void;
}

const ROLE_LABELS: Record<Role, string> = {
  top: "Top", jungle: "Jungle", mid: "Mid", bot: "Bot / ADC", support: "Support",
};

const LOADING_TIPS = [
  "Analyse des données Lolalytics Emerald+...",
  "Calcul des winrates par matchup...",
  "Génération de la stratégie early game...",
  "Analyse des builds optimaux...",
  "Finalisation de l'analyse IA...",
];

export default function MatchupResult({ yourChamp, enemyChamp, role, onReset }: Props) {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buildFetched, setBuildFetched] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  // Rotate loading tips
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % LOADING_TIPS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    async function run() {
      setLoading(true);
      setError("");
      setAnalysis("");
      setBuildFetched(false);

      let buildData = null;
      try {
        const buildRes = await fetch(
          `/api/builds?champId=${yourChamp.key}&champName=${encodeURIComponent(yourChamp.id)}&role=${role}`
        );
        const buildJson = await buildRes.json();
        buildData = buildJson.raw || null;
        setBuildFetched(!!buildData);
      } catch { /* continue without build data */ }

      try {
        const res = await fetch("/api/analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            yourChamp: yourChamp.name,
            enemyChamp: enemyChamp.name,
            role: ROLE_LABELS[role],
            buildData,
          }),
        });
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        setAnalysis(json.analysis);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [yourChamp, enemyChamp, role]);

  return (
    <div className="flex flex-col gap-5 fade-in-up">
      {/* Matchup banner */}
      <div className="glass-card p-5 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-40 h-40 bg-[#C8A847] opacity-5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-40 h-40 bg-red-600 opacity-5 blur-3xl rounded-full pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          {/* Your champion */}
          <ChampionCard
            champ={yourChamp}
            label={ROLE_LABELS[role]}
            labelColor="text-[#C8A847]"
            borderColor="border-[#C8A847]"
            glow="shadow-[0_0_20px_rgba(200,168,71,0.3)]"
          />

          {/* VS center */}
          <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
            <span
              className="text-3xl font-black text-[#1E3A5F] tracking-wider"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              VS
            </span>
            <div className="gold-divider w-full" />
            {buildFetched && (
              <span className="badge badge-green text-[10px]">✓ Builds Lolalytics</span>
            )}
            {!buildFetched && !loading && (
              <span className="badge badge-gold text-[10px]">IA Knowledge</span>
            )}
          </div>

          {/* Enemy champion */}
          <ChampionCard
            champ={enemyChamp}
            label="Ennemi"
            labelColor="text-red-400"
            borderColor="border-red-800"
            glow="shadow-[0_0_20px_rgba(194,59,34,0.25)]"
          />

          {/* Reset */}
          <button
            onClick={onReset}
            className="btn-ghost ml-auto self-start hidden sm:flex"
          >
            ← Nouveau matchup
          </button>
        </div>

        <button onClick={onReset} className="btn-ghost mt-4 w-full sm:hidden">
          ← Nouveau matchup
        </button>
      </div>

      {/* Analysis panel */}
      <div className="glass-card p-6">
        {/* Panel header */}
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-lg font-bold text-white flex items-center gap-2"
            style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.05em' }}
          >
            <span className="text-[#C8A847]">⚔</span>
            Analyse : {yourChamp.name} <span className="text-[#3A4A60]">vs</span> {enemyChamp.name}
          </h2>
          <span className="badge badge-blue text-[10px]">Groq LLaMA 3.3 70B</span>
        </div>

        <div className="gold-divider mb-6" />

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center gap-6 py-16">
            {/* Animated champions during load */}
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 relative rounded-xl overflow-hidden border border-[rgba(200,168,71,0.3)] opacity-70">
                <Image src={yourChamp.image} alt={yourChamp.name} fill sizes="56px" className="object-cover" unoptimized />
              </div>
              <div className="spinner" />
              <div className="w-14 h-14 relative rounded-xl overflow-hidden border border-[rgba(239,68,68,0.3)] opacity-70">
                <Image src={enemyChamp.image} alt={enemyChamp.name} fill sizes="56px" className="object-cover" unoptimized />
              </div>
            </div>
            <div className="text-center">
              <p className="text-[#8A9BB5] text-sm transition-all duration-500">
                {LOADING_TIPS[tipIndex]}
              </p>
              <p className="text-[#3A4A60] text-xs mt-2">Analyse IA en cours...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-5">
            <p className="text-red-400 font-semibold mb-1">Erreur d&apos;analyse</p>
            <p className="text-red-400/70 text-sm">{error}</p>
            <button onClick={onReset} className="btn-ghost mt-4 text-xs">
              ← Réessayer
            </button>
          </div>
        )}

        {/* Analysis content */}
        {analysis && !loading && (
          <div className="analysis-body">
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2>{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-white font-semibold text-sm mt-4 mb-2 uppercase tracking-wider text-[#8A9BB5]">
                    {children}
                  </h3>
                ),
                p: ({ children }) => <p>{children}</p>,
                ul: ({ children }) => <ul>{children}</ul>,
                li: ({ children }) => <li>{children}</li>,
                strong: ({ children }) => <strong>{children}</strong>,
                code: ({ children }) => <code>{children}</code>,
              }}
            >
              {analysis}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

function ChampionCard({
  champ,
  label,
  labelColor,
  borderColor,
  glow,
}: {
  champ: Champion;
  label: string;
  labelColor: string;
  borderColor: string;
  glow: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div className={`w-16 h-16 sm:w-20 sm:h-20 relative rounded-xl overflow-hidden border-2 ${borderColor} ${glow}`}>
        <Image src={champ.image} alt={champ.name} fill sizes="80px" className="object-cover" unoptimized />
      </div>
      <div className="text-center">
        <div className="text-white text-sm font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          {champ.name}
        </div>
        <div className={`text-xs ${labelColor}`}>{label}</div>
      </div>
    </div>
  );
}
