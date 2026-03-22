import { NextResponse } from "next/server";

// Cache the champion list for 1 hour
let cache: { data: unknown; ts: number } | null = null;
const CACHE_TTL = 3600 * 1000;

async function getLatestPatch(): Promise<string> {
  const res = await fetch("https://ddragon.leagueoflegends.com/api/versions.json", {
    next: { revalidate: 3600 },
  });
  const versions = await res.json();
  return versions[0];
}

export async function GET() {
  try {
    if (cache && Date.now() - cache.ts < CACHE_TTL) {
      return NextResponse.json(cache.data);
    }

    const patch = await getLatestPatch();
    const res = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${patch}/data/fr_FR/champion.json`,
      { next: { revalidate: 3600 } }
    );
    const json = await res.json();

    const champions = Object.values(json.data as Record<string, {
      id: string;
      key: string;
      name: string;
      image: { full: string };
    }>).map((c) => ({
      id: c.id,
      key: c.key,
      name: c.name,
      image: `https://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${c.image.full}`,
    })).sort((a, b) => a.name.localeCompare(b.name));

    cache = { data: { champions, patch }, ts: Date.now() };
    return NextResponse.json({ champions, patch });
  } catch (err) {
    console.error("Champions API error:", err);
    return NextResponse.json({ error: "Impossible de charger les champions" }, { status: 500 });
  }
}
