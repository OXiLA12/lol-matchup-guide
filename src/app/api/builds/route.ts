import { NextRequest, NextResponse } from "next/server";

// Lolalytics lane mapping
const LANE_MAP: Record<string, string> = {
  top: "top",
  jungle: "jungle",
  mid: "mid",
  bot: "bottom",
  support: "support",
};

export interface BuildData {
  items: { core: string[]; boots: string; situational: string[] };
  runes: { keystone: string; primary: string[]; secondary: string[] };
  spells: string[];
  startItems: string[];
  winRate: number | null;
  patch: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const champId = searchParams.get("champId"); // numeric ID e.g. "950"
  const champName = searchParams.get("champName"); // e.g. "Naafiri"
  const role = searchParams.get("role") || "mid";
  const enemyId = searchParams.get("enemyId"); // optional

  if (!champId || !champName) {
    return NextResponse.json({ error: "champId and champName required" }, { status: 400 });
  }

  const lane = LANE_MAP[role] || role;

  try {
    // Fetch Lolalytics data — always current patch (patch="" = latest)
    const url = `https://lolalytics.com/api/champion2/?cid=${champId}&tier=platinum_plus&patch=&region=all&lane=${lane}&queue=ranked&heatmap=n`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": `https://lolalytics.com/lol/${champName.toLowerCase()}/build/`,
        "Accept": "application/json",
      },
      next: { revalidate: 1800 }, // 30min cache
    });

    if (!res.ok) {
      throw new Error(`Lolalytics returned ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json({ raw: data, champName, role, lane });

  } catch (err) {
    console.error("Builds API error:", err);
    // Return empty so the AI can still generate analysis
    return NextResponse.json({ raw: null, champName, role, lane, error: String(err) });
  }
}
