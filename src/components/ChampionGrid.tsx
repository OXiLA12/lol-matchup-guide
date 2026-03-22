"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Champion } from "@/app/page";

interface Props {
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/champions")
      .then(r => r.json())
      .then(d => { setChampions(d.champions || []); setPatch(d.patch || ""); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, [loading]);

  const filtered = champions.filter(
    c => c.id !== excludeId && c.name.toLowerCase().includes(search.toLowerCase())
  );

  function pick(c: Champion) {
    setSelected(c.id);
    setTimeout(() => onSelect(c), 120);
  }

  return (
    <div className="fade-up flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="btn btn-ghost h-8 px-3 text-xs">← Retour</button>
        <div className="divider flex-1" />
        {patch && <span className="badge badge-outline text-[10px]">Patch {patch}</span>}
      </div>

      {/* Title */}
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{subtitle}</p>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-xs">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] text-sm pointer-events-none">
          ⌕
        </span>
        <input
          ref={inputRef}
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input pl-8"
        />
      </div>

      {/* Count */}
      {!loading && (
        <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
          {filtered.length} champion{filtered.length > 1 ? "s" : ""}
          {search && <span> · &quot;{search}&quot;</span>}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3">
          <div className="spinner" />
          <span className="text-sm text-[hsl(var(--muted-foreground))]">Chargement...</span>
        </div>
      ) : (
        <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-12 lg:grid-cols-14 gap-1">
          {filtered.map(c => (
            <button
              key={c.id}
              onClick={() => pick(c)}
              title={c.name}
              className={`champion-item flex flex-col items-center gap-0.5 p-1 rounded-md border bg-[hsl(var(--card))]
                ${selected === c.id ? "selected border-[var(--gold)]" : "border-[hsl(var(--border))]"}`}
            >
              <div className="w-full aspect-square relative rounded overflow-hidden">
                <Image src={c.image} alt={c.name} fill sizes="56px" className="object-cover" unoptimized />
              </div>
              <span className="text-[9px] text-[hsl(var(--muted-foreground))] truncate w-full text-center leading-none px-0.5">
                {c.name}
              </span>
            </button>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 text-sm text-[hsl(var(--muted-foreground))]">
          Aucun champion pour &quot;{search}&quot;
        </div>
      )}
    </div>
  );
}
