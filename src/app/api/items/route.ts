import { NextResponse } from "next/server";

let cache: { items: Record<string, ItemData>; patch: string; ts: number } | null = null;
const TTL = 3600 * 1000;

export interface ItemData {
  id: string;
  name: string;
  description: string;
  image: string;
  gold: number;
  tags: string[];
}

async function getLatestPatch(): Promise<string> {
  const r = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
  const v = await r.json();
  return v[0];
}

export async function GET() {
  try {
    if (cache && Date.now() - cache.ts < TTL) {
      return NextResponse.json({ items: cache.items, patch: cache.patch });
    }

    const patch = await getLatestPatch();
    const r = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${patch}/data/fr_FR/item.json`,
      { next: { revalidate: 3600 } }
    );
    const json = await r.json();

    const items: Record<string, ItemData> = {};
    for (const [id, raw] of Object.entries(json.data as Record<string, {
      name: string;
      plaintext: string;
      description: string;
      image: { full: string };
      gold: { total: number };
      tags: string[];
      maps: Record<string, boolean>;
    }>)) {
      // Only include items available on Summoner's Rift (map 11)
      if (!raw.maps?.["11"]) continue;
      // Skip consumables and basic components under 400g with no tags
      if (raw.gold.total < 300) continue;

      items[id] = {
        id,
        name: raw.name,
        description: raw.plaintext || raw.description.replace(/<[^>]*>/g, "").slice(0, 120),
        image: `https://ddragon.leagueoflegends.com/cdn/${patch}/img/item/${raw.image.full}`,
        gold: raw.gold.total,
        tags: raw.tags || [],
      };
    }

    cache = { items, patch, ts: Date.now() };
    return NextResponse.json({ items, patch });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
