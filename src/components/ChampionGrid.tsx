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

export default function ChampionGrid({ title, subtitle, onSelect, onBack, excludeId }: Props) {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [patch, setPatch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/champions")
      .then((r) => r.json())
      .then((d) => { setChampions(d.champions || []); setPatch(d.patch || ""); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = champions.filter(
    (c) => c.id !== excludeId && c.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleSelect(c: Champion) {
    setSelected(c.id);
    setTimeout(() => onSelect(c), 120);
  }

  return (
    <div className="flex flex-col gap-5 fade-in-up">
      {/* Header row */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={onBack} className="btn-ghost text-xs">
          ← Retour
        </button>
        <div className="gold-divider flex-1 min-w-[40px]" />
        {patch && (
          <span className="badge badge-gold">Patch {patch}</span>
        )}
      </div>

      {/* Title */}
      <div>
        <h2
          className="text-2xl font-bold text-white"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
        >
          {title}
        </h2>
        <p className="text-[#8A9BB5] text-sm mt-1">{subtitle}</p>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-xs">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3A4A60] text-sm pointer-events-none">
          🔍
        </span>
        <input
          type="text"
          placeholder="Rechercher un champion..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
          className="search-input pl-9"
        />
      </div>

      {/* Count */}
      {!loading && (
        <p className="text-[#3A4A60] text-xs">
          {filtered.length} champion{filtered.length > 1 ? "s" : ""}
          {search && ` pour "${search}"`}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center gap-4 py-24">
          <div className="spinner" />
          <p className="text-[#3A4A60] text-sm">Chargement des champions...</p>
        </div>
      ) : (
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 gap-1.5">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelect(c)}
              title={c.name}
              className={`champion-item flex flex-col items-center gap-1 p-1 rounded-lg border bg-[rgba(11,22,40,0.6)] transition-all
                ${selected === c.id
                  ? "border-[#C8A847] selected"
                  : "border-[rgba(200,168,71,0.08)]"
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
                {selected === c.id && (
                  <div className="absolute inset-0 bg-[#C8A847] opacity-20" />
                )}
              </div>
              <span className="text-[9px] text-[#8A9BB5] truncate w-full text-center leading-tight px-0.5">
                {c.name}
              </span>
            </button>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[#3A4A60] text-sm">Aucun champion pour &quot;{search}&quot;</p>
        </div>
      )}
    </div>
  );
}
