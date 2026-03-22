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
  "Chargement des items du patch 16.6.1...",
  "Analyse du matchup en cours...",
  "Calcul des builds optimaux...",
  "Évaluation du winrate...",
  "Finalisation de l'analyse IA...",
];

const DIFFICULTY_COLORS = {
  "Facile": "text-[var(--green)] bg-[rgba(74,222,128,0.08)] border-[rgba(74,222,128,0.2)]",
  "Moyen": "text-[var(--gold)] bg-[rgba(200,168,71,0.08)] border-[rgba(200,168,71,0.2)]",
  "Difficile": "text-orange-400 bg-[rgba(251,146,60,0.08)] border-[rgba(251,146,60,0.2)]",
  "Très difficile": "text-[var(--red)] bg-[rgba(248,113,113,0.08)] border-[rgba(248,113,113,0.2)]",
};

const ADVANTAGE_COLORS = {
  "Avantage": "text-[var(--green)]",
  "Neutre": "text-[hsl(var(--muted-foreground))]",
  "Désavantage": "text-[var(--red)]",
};

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

      let catalog: Record<string, ItemData> = {};
      try {
        const r = await fetch("/api/items");
        const j = await r.json();
        catalog = j.items || {};
        setItemCatalog(catalog);
      } catch { /* continue */ }

      try {
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

      {/* ── Matchup banner ── */}
      <div className="card p-4">
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <ChampCard champ={yourChamp} sub={ROLE_LABELS[role]} subColor="text-[var(--gold)]" borderColor="border-[rgba(200,168,71,0.4)]" />

          {/* Center: winrate + difficulty */}
          <div className="flex-1 flex flex-col items-center gap-1.5 min-w-[100px]">
            {result?.matchup ? (
              <>
                <WinrateBar winrate={result.matchup.winrate} />
                <span className={`badge text-[10px] border ${DIFFICULTY_COLORS[result.matchup.difficulty]}`}>
                  {result.matchup.difficulty}
                </span>
                <span className={`text-[10px] font-medium ${ADVANTAGE_COLORS[result.matchup.advantage]}`}>
                  {result.matchup.advantage}
                </span>
              </>
            ) : (
              <span className="text-[10px] text-[hsl(var(--muted-foreground))] tracking-widest font-semibold">VS</span>
            )}
          </div>

          <ChampCard champ={enemyChamp} sub="Ennemi" subColor="text-[var(--red)]" borderColor="border-[rgba(248,113,113,0.4)]" reverse />
          <button onClick={onReset} className="btn btn-ghost text-xs h-8 ml-auto hidden sm:flex">← Nouveau</button>
        </div>

        {/* Tip row */}
        {result?.matchup?.tip && (
          <div className="mt-3 pt-3 border-t text-xs text-[hsl(var(--muted-foreground))] italic">
            💡 {result.matchup.tip}
          </div>
        )}
        <button onClick={onReset} className="btn btn-ghost text-xs h-7 mt-3 sm:hidden w-full">← Nouveau matchup</button>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="card p-6 flex flex-col items-center gap-4 py-14">
          <div className="flex items-center gap-4">
            <div className="relative w-10 h-10 rounded overflow-hidden opacity-60 flex-shrink-0">
              <Image src={yourChamp.image} alt="" fill sizes="40px" className="object-cover" unoptimized />
            </div>
            <div className="spinner" />
            <div className="relative w-10 h-10 rounded overflow-hidden opacity-60 flex-shrink-0">
              <Image src={enemyChamp.image} alt="" fill sizes="40px" className="object-cover" unoptimized />
            </div>
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{TIPS[tip]}</p>
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <div className="card p-4 border-[rgba(248,113,113,0.3)]">
          <p className="text-sm font-medium text-[var(--red)]">Erreur d&apos;analyse</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 font-mono">{error}</p>
          <button onClick={onReset} className="btn btn-ghost text-xs h-7 mt-3">← Réessayer</button>
        </div>
      )}

      {result && !loading && (
        <>
          {/* ── Build card ── */}
          <div className="card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Build recommandé</h2>
              <span className="badge badge-gold text-[10px]">Patch 16.6.1</span>
            </div>
            <div className="divider" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BuildSection label="Items de départ" items={result.build.startItems} catalog={itemCatalog} size={36} />

              {result.build.firstItem && (
                <div>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1.5">
                    1er item (prioritaire)
                  </div>
                  <div className="flex items-center gap-2">
                    <ItemIcon itemName={result.build.firstItem} catalog={itemCatalog} size={44} />
                    <div>
                      <div className="text-xs font-medium text-white">{result.build.firstItem}</div>
                      <div className="text-[10px] text-[hsl(var(--muted-foreground))]">Item prioritaire pour ce matchup</div>
                    </div>
                  </div>
                </div>
              )}

              <BuildSection label="Items core" items={result.build.coreItems} catalog={itemCatalog} size={36} />

              {result.build.boots && (
                <div>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1.5">Bottes</div>
                  <div className="flex items-center gap-2">
                    <ItemIcon itemName={result.build.boots} catalog={itemCatalog} size={36} />
                    <span className="text-xs text-white">{result.build.boots}</span>
                  </div>
                </div>
              )}

              {/* Anti-heal (highlighted separately) */}
              {result.build.antiHeal?.length > 0 && (
                <div className="sm:col-span-2 p-3 rounded-md border border-[rgba(248,113,113,0.2)] bg-[rgba(248,113,113,0.04)]">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--red)] mb-2">
                    🩸 Anti-Heal recommandé vs {enemyChamp.name}
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    {result.build.antiHeal.map((name, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <ItemIcon itemName={name} catalog={itemCatalog} size={32} />
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.build.situational?.length > 0 && (
                <div className="sm:col-span-2">
                  <BuildSection label="Items situationnels" items={result.build.situational} catalog={itemCatalog} size={32} />
                </div>
              )}
            </div>

            {/* Runes + Spells */}
            <div className="divider" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">Runes</div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-[var(--gold)]">⬡ {result.build.runes.keystone}</div>
                  {result.build.runes.primary.map((r, i) => (
                    <div key={i} className="text-xs text-[hsl(var(--muted-foreground))] pl-3">· {r}</div>
                  ))}
                  <div className="pt-1 border-t border-[hsl(var(--border))]">
                    {result.build.runes.secondary.map((r, i) => (
                      <div key={i} className="text-xs text-[hsl(var(--muted-foreground))] pl-3">· {r}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">Sorts d&apos;invocateur</div>
                <div className="flex gap-2">
                  {result.build.spells.map((s, i) => (
                    <span key={i} className="badge badge-outline text-xs">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Analysis card ── */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">
                Stratégie : {yourChamp.name} vs {enemyChamp.name}
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

/* ── Winrate bar ── */
function WinrateBar({ winrate }: { winrate: number }) {
  const color = winrate >= 55 ? "var(--green)" : winrate >= 50 ? "var(--gold)" : winrate >= 45 ? "orange" : "var(--red)";
  return (
    <div className="flex flex-col items-center gap-1 w-full px-2">
      <span className="text-base font-bold" style={{ color }}>{winrate}%</span>
      <div className="w-full h-1 rounded-full bg-[hsl(var(--muted))]">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${winrate}%`, background: color }}
        />
      </div>
      <span className="text-[9px] text-[hsl(var(--muted-foreground))]">Winrate estimé</span>
    </div>
  );
}

/* ── Champ portrait ── */
function ChampCard({ champ, sub, subColor, borderColor, reverse }: {
  champ: Champion; sub: string; subColor: string; borderColor: string; reverse?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2.5 flex-shrink-0 ${reverse ? "flex-row-reverse" : ""}`}>
      <div className={`relative w-12 h-12 rounded-md overflow-hidden border ${borderColor} flex-shrink-0`}>
        <Image src={champ.image} alt={champ.name} fill sizes="48px" className="object-cover" unoptimized />
      </div>
      <div className={reverse ? "text-right" : ""}>
        <div className="text-sm font-medium text-white leading-tight">{champ.name}</div>
        <div className={`text-[11px] ${subColor}`}>{sub}</div>
      </div>
    </div>
  );
}
