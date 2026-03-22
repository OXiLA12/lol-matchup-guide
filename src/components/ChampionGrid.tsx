"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Champion, Role } from "@/app/page";

interface Props {
  role: Role;
  title: string;
  subtitle: string;
  onSelect: (c: Champion) => void;
  onBack: () => void;
  excludeId?: string;
}

export default function ChampionGrid({ role, title, subtitle, onSelect, onBack, excludeId }: Props) {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [patch, setPatch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/champions")
      .then((r) => r.json())
      .then((d) => {
        setChampions(d.champions || []);
        setPatch(d.patch || "");
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = champions.filter(
    (c) =>
      c.id !== excludeId &&
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleSelect(c: Champion) {
    setSelected(c.id);
    setTimeout(() => onSelect(c), 150);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition text-sm flex items-center gap-1"
        >
          ← Retour
        </button>
        <div className="gold-divider flex-1" />
        {patch && <span className="text-xs text-gray-600">Patch {patch}</span>}
      </div>

      <div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Rechercher un champion..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoFocus
        className="w-full max-w-sm px-4 py-2 rounded-lg bg-[#0A1428] border border-[#1E3A5F] text-white placeholder-gray-500 focus:outline-none focus:border-[#C8A847] transition"
      />

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="spinner" />
        </div>
      ) : (
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelect(c)}
              title={c.name}
              className={`champion-item flex flex-col items-center gap-1 p-1 rounded-lg bg-[#0A1428] border transition-all duration-150
                ${selected === c.id
                  ? "border-[#C8A847] scale-105"
                  : "border-[#1E3A5F] hover:border-[#C8A847]"
                }`}
            >
              <div className="w-full aspect-square relative rounded overflow-hidden">
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="60px"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <span className="text-[10px] text-gray-300 truncate w-full text-center leading-tight">
                {c.name}
              </span>
            </button>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-gray-500 text-center py-8">Aucun champion trouvé pour &quot;{search}&quot;</p>
      )}
    </div>
  );
}
