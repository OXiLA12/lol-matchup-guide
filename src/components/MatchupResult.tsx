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

const TIPS = [
  "Analyse des données Lolalytics Emerald+...",
  "Calcul des winrates par matchup...",
  "Génération de la stratégie early game...",
  "Analyse des items optimaux...",
  "Finalisation de l'analyse IA...",
];

export default function MatchupResult({ yourChamp, enemyChamp, role, onReset }: Props) {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buildOk, setBuildOk] = useState(false);
  const [tip, setTip] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setTip(i => (i + 1) % TIPS.length), 1800);
    return () => clearInterval(t);
  }, [loading]);

  useEffect(() => {
    (async () => {
      setLoading(true); setError(""); setAnalysis(""); setBuildOk(false);

      let buildData = null;
      try {
        const r = await fetch(`/api/builds?champId=${yourChamp.key}&champName=${encodeURIComponent(yourChamp.id)}&role=${role}`);
        const j = await r.json();
        buildData = j.raw || null;
        setBuildOk(!!buildData);
      } catch { /* continue */ }

      try {
        const r = await fetch("/api/analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ yourChamp: yourChamp.name, enemyChamp: enemyChamp.name, role: ROLE_LABELS[role], buildData }),
        });
        const j = await r.json();
        if (j.error) throw new Error(j.error);
        setAnalysis(j.analysis);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [yourChamp, enemyChamp, role]);

  return (
    <div className="fade-up flex flex-col gap-4">

      {/* ── Matchup header card ── */}
      <div className="card p-4">
        <div className="flex items-center gap-4">

          {/* Your champ */}
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-md overflow-hidden border border-[rgba(200,168,71,0.4)]">
              <Image src={yourChamp.image} alt={yourChamp.name} fill sizes="48px" className="object-cover" unoptimized />
            </div>
            <div>
              <div className="text-sm font-medium text-white">{yourChamp.name}</div>
              <div className="text-[11px] text-[var(--gold)]">{ROLE_LABELS[role]}</div>
            </div>
          </div>

          {/* VS */}
          <div className="flex-1 flex items-center justify-center">
            <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))] tracking-widest">VS</span>
          </div>

          {/* Enemy champ */}
          <div className="flex items-center gap-3">
            <div>
              <div className="text-sm font-medium text-white text-right">{enemyChamp.name}</div>
              <div className="text-[11px] text-[var(--red)] text-right">Ennemi</div>
            </div>
            <div className="relative w-12 h-12 rounded-md overflow-hidden border border-[rgba(248,113,113,0.4)]">
              <Image src={enemyChamp.image} alt={enemyChamp.name} fill sizes="48px" className="object-cover" unoptimized />
            </div>
          </div>

          {/* Spacer + reset */}
          <div className="ml-auto hidden sm:block">
            <button onClick={onReset} className="btn btn-ghost text-xs h-8">← Nouveau</button>
          </div>
        </div>

        {/* Status row */}
        <div className="mt-3 pt-3 border-t flex items-center gap-2 flex-wrap">
          {buildOk
            ? <span className="badge badge-green text-[10px]">✓ Builds Lolalytics chargés</span>
            : !loading && <span className="badge badge-outline text-[10px]">Analyse depuis connaissance IA</span>
          }
          <span className="badge badge-outline text-[10px]">Groq LLaMA 3.3 70B</span>
          <button onClick={onReset} className="btn btn-ghost text-xs h-7 sm:hidden ml-auto">← Nouveau</button>
        </div>
      </div>

      {/* ── Analysis card ── */}
      <div className="card p-5">
        {/* Card header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">
            Analyse : {yourChamp.name} <span className="text-[hsl(var(--muted-foreground))]">vs</span> {enemyChamp.name}
          </h2>
          {!loading && analysis && (
            <span className="badge badge-gold text-[10px]">✓ Analyse complète</span>
          )}
        </div>
        <div className="divider mb-4" />

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-14">
            <div className="flex items-center gap-4">
              <div className="relative w-10 h-10 rounded-md overflow-hidden opacity-60">
                <Image src={yourChamp.image} alt="" fill sizes="40px" className="object-cover" unoptimized />
              </div>
              <div className="spinner" />
              <div className="relative w-10 h-10 rounded-md overflow-hidden opacity-60">
                <Image src={enemyChamp.image} alt="" fill sizes="40px" className="object-cover" unoptimized />
              </div>
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] text-center transition-all">{TIPS[tip]}</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-md border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.05)] p-4">
            <p className="text-sm text-[var(--red)] font-medium">Erreur d&apos;analyse</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{error}</p>
            <button onClick={onReset} className="btn btn-ghost text-xs h-7 mt-3">← Réessayer</button>
          </div>
        )}

        {/* Analysis */}
        {analysis && !loading && (
          <div className="analysis-body">
            <ReactMarkdown
              components={{
                h2: ({ children }) => <h2>{children}</h2>,
                h3: ({ children }) => <h3 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mt-4 mb-2">{children}</h3>,
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
