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
  top: "Top",
  jungle: "Jungle",
  mid: "Mid",
  bot: "Bot / ADC",
  support: "Support",
};

export default function MatchupResult({ yourChamp, enemyChamp, role, onReset }: Props) {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buildFetched, setBuildFetched] = useState(false);

  useEffect(() => {
    async function run() {
      setLoading(true);
      setError("");
      setAnalysis("");

      // 1. Fetch builds from Lolalytics
      let buildData = null;
      try {
        const buildRes = await fetch(
          `/api/builds?champId=${yourChamp.key}&champName=${encodeURIComponent(yourChamp.id)}&role=${role}`
        );
        const buildJson = await buildRes.json();
        buildData = buildJson.raw || null;
        setBuildFetched(!!buildData);
      } catch {
        setBuildFetched(false);
      }

      // 2. Call AI analysis
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
    <div className="flex flex-col gap-6">
      {/* Matchup header */}
      <div className="flex items-center gap-4 p-4 rounded-xl border border-[#1E3A5F] bg-[#0A1428]">
        {/* Your champ */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-16 h-16 relative rounded-lg overflow-hidden border-2 border-[#C8A847]">
            <Image src={yourChamp.image} alt={yourChamp.name} fill sizes="64px" className="object-cover" unoptimized />
          </div>
          <span className="text-white text-sm font-semibold">{yourChamp.name}</span>
          <span className="text-[#C8A847] text-xs">{ROLE_LABELS[role]}</span>
        </div>

        {/* VS */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <span className="text-2xl font-black text-gray-600">VS</span>
          <div className="gold-divider w-full" />
          {buildFetched && (
            <span className="text-xs text-green-500">✓ Builds Lolalytics chargés</span>
          )}
        </div>

        {/* Enemy champ */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-16 h-16 relative rounded-lg overflow-hidden border-2 border-red-800">
            <Image src={enemyChamp.image} alt={enemyChamp.name} fill sizes="64px" className="object-cover" unoptimized />
          </div>
          <span className="text-white text-sm font-semibold">{enemyChamp.name}</span>
          <span className="text-red-400 text-xs">Ennemi</span>
        </div>

        {/* Reset button */}
        <button
          onClick={onReset}
          className="ml-auto px-4 py-2 rounded-lg border border-[#1E3A5F] text-gray-400 hover:border-[#C8A847] hover:text-white transition text-sm"
        >
          Nouveau matchup
        </button>
      </div>

      {/* Analysis */}
      <div className="rounded-xl border border-[#1E3A5F] bg-[#0A1428] p-6">
        {loading && (
          <div className="flex flex-col items-center gap-4 py-16">
            <div className="spinner" />
            <p className="text-gray-400 text-sm">
              Analyse en cours pour {yourChamp.name} vs {enemyChamp.name}...
            </p>
            <p className="text-gray-600 text-xs">Récupération des données Lolalytics + analyse IA</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400">
            <p className="font-semibold">Erreur</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={onReset}
              className="mt-3 text-sm text-[#C8A847] hover:underline"
            >
              Réessayer
            </button>
          </div>
        )}

        {analysis && !loading && (
          <div className="prose prose-invert prose-sm max-w-none analysis-content">
            <AnalysisMarkdown content={analysis} />
          </div>
        )}
      </div>
    </div>
  );
}

function AnalysisMarkdown({ content }: { content: string }) {
  return (
    <div className="analysis-body">
      <ReactMarkdown
        components={{
          h2: ({ children }) => (
            <h2 className="text-[#C8A847] font-bold text-lg mt-6 mb-3 flex items-center gap-2 border-b border-[#1E3A5F] pb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-white font-semibold text-base mt-4 mb-2">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-gray-300 text-sm leading-relaxed mb-3">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-none space-y-1 mb-3">{children}</ul>
          ),
          li: ({ children }) => (
            <li className="text-gray-300 text-sm flex items-start gap-2">
              <span className="text-[#C8A847] mt-0.5 flex-shrink-0">›</span>
              <span>{children}</span>
            </li>
          ),
          strong: ({ children }) => (
            <strong className="text-white font-semibold">{children}</strong>
          ),
          code: ({ children }) => (
            <code className="bg-[#1E3A5F] text-[#0BC4E3] px-1.5 py-0.5 rounded text-xs font-mono">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
