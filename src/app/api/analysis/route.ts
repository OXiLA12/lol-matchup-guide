import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import type { AnalysisResponse } from "@/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface AnalysisRequest {
  yourChamp: string;
  enemyChamp: string;
  role: string;
  itemCatalog: Record<string, { name: string; tags: string[] }>;
}

export async function POST(req: NextRequest) {
  try {
    const body: AnalysisRequest = await req.json();
    const { yourChamp, enemyChamp, role, itemCatalog } = body;

    const itemNames = Object.values(itemCatalog).map(i => i.name).join(", ");

    const antiHealItems = [
      "Cœur brisé", "Exécuteur", "Ombre funeste", "Morellonomicon",
      "Masque de Lièvre", "Briseur de chaînes", "Lame du Roi déchu",
    ];

    const systemPrompt = `Tu es un coach League of Legends Diamond+ expert en matchups (patch 16.6.1, Saison 2025).
Tu réponds UNIQUEMENT en français.
Tu dois utiliser les VRAIS noms français des items tels qu'ils existent dans le jeu (ex: "Cyclosabre voltaïque", "Éclipse", "Brèche de Serylda", "Lame de l'infini").
JAMAIS inventer un item qui n'existe pas dans la liste fournie.
Pour les items anti-heal, utilise: ${antiHealItems.join(", ")}.`;

    const userPrompt = `MATCHUP: ${yourChamp} (${role}) vs ${enemyChamp}

Items disponibles patch 16.6.1: ${itemNames.slice(0, 3000)}

Réponds UNIQUEMENT avec ce JSON valide (sans texte avant ou après):
{
  "matchup": {
    "winrate": <number entre 40 et 60, winrate estimé de ${yourChamp} vs ${enemyChamp} en ${role}>,
    "difficulty": <"Facile"|"Moyen"|"Difficile"|"Très difficile">,
    "difficultyScore": <1 à 5>,
    "advantage": <"Avantage"|"Neutre"|"Désavantage">,
    "tip": "<conseil en 1 phrase pour ce matchup>"
  },
  "build": {
    "startItems": ["<item départ 1>", "<item départ 2>"],
    "firstItem": "<1er item complet mythique ou legendary ADAPTÉ à ce matchup>",
    "coreItems": ["<item 2>", "<item 3>", "<item 4>"],
    "boots": "<nom bottes>",
    "antiHeal": <si ${enemyChamp} a du sustain/heal: ["<item antiheal adapté au rôle>"], sinon: []>,
    "situational": ["<item situationnel si ${enemyChamp} est difficile>"],
    "runes": {
      "keystone": "<keystone>",
      "primary": ["<rune 1>", "<rune 2>", "<rune 3>"],
      "secondary": ["<rune 1>", "<rune 2>"]
    },
    "spells": ["Éclair", "<2ème sort adapté>"]
  },
  "analysis": "## Phase de couloir (Early game)\\n\\nConseils détaillés... Sorts de ${enemyChamp} à éviter: **Q** (description), **E** (description)...\\n\\n## Mid game (15-25 min)\\n\\nConseils...\\n\\n## Late game (25+ min)\\n\\nConseils...\\n\\n## Conseils clés\\n\\n- Point 1\\n- Point 2\\n- Point 3"
}

RÈGLES:
- "firstItem" doit être l'item META pour ${yourChamp} en ${role} au patch 16.6.1 (ex: pour Naafiri mid → Cyclosabre voltaïque)
- Si ${enemyChamp} a du healing, ajoute un item anti-heal dans "antiHeal"
- Le "winrate" doit refléter la vraie force du matchup`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.25,
      max_tokens: 3500,
    });

    const raw = completion.choices[0]?.message?.content || "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("L'IA n'a pas retourné de JSON valide: " + raw.slice(0, 200));

    const parsed = JSON.parse(jsonMatch[0]) as AnalysisResponse;
    return NextResponse.json(parsed);

  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json(
      { error: "Erreur lors de l'analyse", details: String(err) },
      { status: 500 }
    );
  }
}
