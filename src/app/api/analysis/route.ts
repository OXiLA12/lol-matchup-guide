import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface AnalysisRequest {
  yourChamp: string;
  enemyChamp: string;
  role: string;
  buildData: unknown;
}

function extractBuildSummary(raw: unknown): string {
  if (!raw || typeof raw !== "object") return "Données de build non disponibles.";

  const r = raw as Record<string, unknown>;

  const lines: string[] = [];

  // Try to extract items
  if (r.items && typeof r.items === "object") {
    const items = r.items as Record<string, unknown>;
    const itemNames = Object.values(items)
      .flat()
      .slice(0, 15)
      .map((item: unknown) => {
        if (typeof item === "object" && item !== null) {
          const i = item as Record<string, unknown>;
          return i.name || i.n || i.item_name || null;
        }
        return null;
      })
      .filter(Boolean);
    if (itemNames.length > 0) {
      lines.push(`Items populaires: ${itemNames.join(", ")}`);
    }
  }

  // Try to extract runes
  if (r.runes && typeof r.runes === "object") {
    lines.push("Runes: données disponibles");
  }

  // Try win rate
  if (r.header && typeof r.header === "object") {
    const h = r.header as Record<string, unknown>;
    if (h.wr) lines.push(`Winrate global: ${Number(h.wr).toFixed(1)}%`);
    if (h.pick) lines.push(`Pick rate: ${Number(h.pick).toFixed(2)}%`);
    if (h.patch) lines.push(`Patch: ${h.patch}`);
  }

  return lines.length > 0 ? lines.join("\n") : "Données Lolalytics disponibles mais format non reconnu.";
}

export async function POST(req: NextRequest) {
  try {
    const body: AnalysisRequest = await req.json();
    const { yourChamp, enemyChamp, role, buildData } = body;

    const buildSummary = extractBuildSummary(buildData);

    const prompt = `Tu es un expert League of Legends (LoL) qui analyse des matchups pour des joueurs souhaitant monter en elo.

MATCHUP À ANALYSER:
- Champion joué: ${yourChamp} (${role})
- Champion ennemi: ${enemyChamp}
- Données Lolalytics (patch actuel, Emerald+):
${buildSummary}

Fournis une analyse COMPLÈTE et PRATIQUE du matchup. Inclus obligatoirement:

## Build optimal pour ce matchup
Liste les items recommandés dans l'ordre, en adaptant selon la menace de ${enemyChamp}. Utilise les données Lolalytics ci-dessus + ta connaissance des items actuels. Précise:
- Items de départ
- Premier item / Mythique conseillé
- Items core (3-4 items essentiels)
- Bottes recommandées
- Items situationnels si ${enemyChamp} est difficile

## Runes recommandées
Page de runes complète adaptée à ce matchup.

## Sorts d'invocateur
Quels sorts prendre et pourquoi dans ce matchup.

## Phase de couloir (Early game - 1 à 15 min)
- Comment jouer les premiers niveaux
- Quand prendre les trades
- Quand farmer prudemment
- Capacités dangereuses de ${enemyChamp} à éviter (avec leur touche clavier)
- Condition de spike fort / faible de ${yourChamp}

## Mid game (15 à 25 min)
- Objectifs à prioriser
- Comment utiliser ton avantage ou rattraper le retard
- Positionnement en teamfight vs ${enemyChamp}

## Late game (25 min+)
- Condition de victoire
- Que faire si ${enemyChamp} est fed
- Composition d'équipe idéale avec ${yourChamp}

## Résumé tactique
3 bullet points essentiels à retenir pour gagner ce matchup.

Sois précis, actuel (patch actuel), et pratique. Utilise des emojis pour la lisibilité.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Tu es un coach LoL expert Diamond+ spécialisé dans les matchups. Tu connais parfaitement les items, builds et méta du patch actuel (saison 2025). Tu donnes des conseils précis et actionnables. Tu réponds toujours en français.`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const analysis = completion.choices[0]?.message?.content || "Impossible de générer l'analyse.";

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("Analysis API error:", err);
    return NextResponse.json(
      { error: "Erreur lors de l'analyse IA", details: String(err) },
      { status: 500 }
    );
  }
}
