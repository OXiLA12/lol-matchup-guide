"use client";

import { useState } from "react";
import Image from "next/image";
import { ItemData } from "@/types";

interface Props {
  itemName: string;
  catalog: Record<string, ItemData>;
  size?: number;
}

function findItem(name: string, catalog: Record<string, ItemData>): ItemData | null {
  const lower = name.toLowerCase().trim();
  // Exact match first
  for (const item of Object.values(catalog)) {
    if (item.name.toLowerCase() === lower) return item;
  }
  // Partial match
  for (const item of Object.values(catalog)) {
    if (item.name.toLowerCase().includes(lower) || lower.includes(item.name.toLowerCase())) return item;
  }
  return null;
}

export function ItemIcon({ itemName, catalog, size = 36 }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const item = findItem(itemName, catalog);

  if (!item) {
    // Fallback: show text badge
    return (
      <div
        className="flex items-center justify-center rounded border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[9px] text-[hsl(var(--muted-foreground))] px-1 text-center leading-tight"
        style={{ width: size, height: size, minWidth: size }}
        title={itemName}
      >
        {itemName.slice(0, 8)}
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className="relative rounded overflow-hidden border border-[rgba(200,168,71,0.3)] hover:border-[var(--gold)] transition-all cursor-help flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes={`${size}px`}
          className="object-cover"
          unoptimized
        />
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-44 pointer-events-none">
          <div className="card p-2.5 shadow-xl">
            <div className="text-xs font-semibold text-[var(--gold)] mb-1">{item.name}</div>
            <div className="text-[10px] text-[hsl(var(--muted-foreground))] leading-relaxed">{item.description}</div>
            <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1 font-medium">💰 {item.gold}g</div>
          </div>
        </div>
      )}
    </div>
  );
}

export function BuildSection({
  label,
  items,
  catalog,
  size = 36,
}: {
  label: string;
  items: string[];
  catalog: Record<string, ItemData>;
  size?: number;
}) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1.5">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((name, i) => (
          <ItemIcon key={i} itemName={name} catalog={catalog} size={size} />
        ))}
      </div>
    </div>
  );
}
