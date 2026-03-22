"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { Champion, Role } from "@/app/page";
import { AnalysisResponse } from "@/app/api/analysis/route";
import { ItemData } from "@/app/api/items/route";
import { ItemIcon, BuildSection } from "@/components/ItemDisplay";

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
  "Chargement des items du patch actuel...",
  "Analyse du matchup en cours...",
  "Calcul des builds optimaux...",
  "Génération de la stratégie...",
  "Finalisation de l'analyse IA...",
];

export default function MatchupResult({ yourChamp, enemyChamp, role, onReset }: Props) {
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [itemCatalog, setItemCatalog] = useState<Record<string, ItemData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tip, setTip] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setTip(i => (i + 1) % TIPS.length), 1800);
    return () => clearInterval(t);
  }, [loading]);

  useEffect(() => {
    (async () => {
      setLoading(true); setError(""); setResult(null);

      // 1. Load item catalog from Data Dragon
      let catalog: Record<string, ItemData> = {};
      try {
        const r = await fetch("/api/items");
        const j = await r.json();
        catalog = j.items || {};
        setItemCatalog(catalog);
      } catch { /* continue without catalog */ }

      // 2. Get AI analysis (pass item catalog so AI knows current items)
      try {
        // Build concise catalog for AI (name + tags only)
        const conciseCatalog: Record<string, { name: string; tags: string[] }> = {};
        for (const [id, item] of Object.entries(catalog)) {
          conciseCatalog[id] = { name: item.name, tags: item.tags };
        }

        const r = await fetch("/api/analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            yourChamp: yourChamp.name,
            enemyChamp: enemyChamp.name,
            role: ROLE_LABELS[role],
            itemCatalog: conciseCatalog,
          }),
        });
        const j = await r.json();
        if (j.error) throw new Error(j.details || j.error);
        setResult(j as AnalysisResponse);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [yourChamp, enemyChamp, role]);

  return (
    <div className="fade-up flex flex-col gap-4">

      {/* ── Matchup header ── */}
      <div className="card p-4">
        <div className="flex items-center gap-4">
          <ChampCard champ={yourChamp} sub={ROLE_LABELS[role]} subColor="text-[var(--gold)]" borderColor="border-[rgba(200,168,71,0.4)]" />
          <div className="flex-1 flex items-center justify-center">
            <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))] tracking-widest">VS</span>
          </div>
          <ChampCard champ={enemyChamp} sub="Ennemi" subColor="text-[var(--red)]" borderColor="border-[rgba(248,113,113,0.4)]" reverse />
          <button onClick={onReset} className="btn btn-ghost text-xs h-8 ml-auto hidden sm:flex">← Nouveau</button>
        </div>
        <button onClick={onReset} className="btn btn-ghost text-xs h-7 mt-3 sm:hidden w-full">← Nouveau matchup</button>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="card p-6 flex flex-col items-center gap-4 py-14">
          <div className="flex items-center gap-4">
            <div className="relative w-10 h-10 rounded overflow-hidden opacity-60">
              <Image src={yourChamp.image} alt="" fill sizes="40px" className="object-cover" unoptimized />
            </div>
            <div className="spinner" />
            <div className="relative w-10 h-10 rounded overflow-hidden opacity-60">
              <Image src={enemyChamp.image} alt="" fill sizes="40px" className="object-cover" unoptimized />
            </div>
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{TIPS[tip]}</p>
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <div className="card p-4 border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.04)]">
          <p className="text-sm font-medium text-[var(--red)]">Erreur d&apos;analyse</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{error}</p>
          <button onClick={onReset} className="btn btn-ghost text-xs h-7 mt-3">← Réessayer</button>
        </div>
      )}

      {/* ── Result ── */}
      {result && !loading && (
        <>
          {/* Build card */}
          <div className="card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Build recommandé</h2>
              <span className="badge badge-gold text-[10px]">Patch 16.6.1</span>
            </div>
            <div className="divider" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start items */}
              <BuildSection label="Départ" items={result.build.startItems} catalog={itemCatalog} size={36} />

              {/* First item */}
              {result.build.firstItem && (
                <div>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1.5">
                    1er item (Mythique)
                  </div>
                  <ItemIcon itemName={result.build.firstItem} catalog={itemCatalog} size={42} />
                </div>
              )}

              {/* Core items */}
              <BuildSection label="Items core" items={result.build.coreItems} catalog={itemCatalog} size={36} />

              {/* Boots */}
              {result.build.boots && (
                <div>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1.5">Bottes</div>
                  <ItemIcon itemName={result.build.boots} catalog={itemCatalog} size={36} />
                </div>
              )}

              {/* Situational */}
              {result.build.situational?.length > 0 && (
                <div className="sm:col-span-2">
                  <BuildSection label={`Situationnels (vs ${enemyChamp.name})`} items={result.build.situational} catalog={itemCatalog} size={32} />
                </div>
              )}
            </div>

            {/* Runes + Spells */}
            <div className="divider" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">Runes</div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-[var(--gold)]">{result.build.runes.keystone}</div>
                  {result.build.runes.primary.map((r, i) => (
                    <div key={i} className="text-xs text-[hsl(var(--muted-foreground))]">· {r}</div>
                  ))}
                  <div className="pt-1">
                    {result.build.runes.secondary.map((r, i) => (
                      <div key={i} className="text-xs text-[hsl(var(--muted-foreground))]">· {r}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">Sorts</div>
                <div className="flex gap-2">
                  {result.build.spells.map((s, i) => (
                    <span key={i} className="badge badge-outline text-xs">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Analysis card */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">
                Analyse : {yourChamp.name} <span className="text-[hsl(var(--muted-foreground))]">vs</span> {enemyChamp.name}
              </h2>
              <span className="badge badge-outline text-[10px]">Groq LLaMA 3.3 70B</span>
            </div>
            <div className="divider mb-4" />
            <div className="analysis-body">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => <h2>{children}</h2>,
                  p: ({ children }) => <p>{children}</p>,
                  ul: ({ children }) => <ul>{children}</ul>,
                  li: ({ children }) => <li>{children}</li>,
                  strong: ({ children }) => <strong>{children}</strong>,
                  code: ({ children }) => <code>{children}</code>,
                }}
              >
                {result.analysis}
              </ReactMarkdown>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ChampCard({ champ, sub, subColor, borderColor, reverse }: {
  champ: Champion; sub: string; subColor: string; borderColor: string; reverse?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 ${reverse ? "flex-row-reverse" : ""}`}>
      <div className={`relative w-12 h-12 rounded-md overflow-hidden border ${borderColor} flex-shrink-0`}>
        <Image src={champ.image} alt={champ.name} fill sizes="48px" className="object-cover" unoptimized />
      </div>
      <div className={reverse ? "text-right" : ""}>
        <div className="text-sm font-medium text-white">{champ.name}</div>
        <div className={`text-[11px] ${subColor}`}>{sub}</div>
      </div>
    </div>
  );
}
