import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface AnalysisRequest {
  yourChamp: string;
  enemyChamp: string;
  role: string;
  itemCatalog: Record<string, { name: string; tags: string[] }>;
}

export interface AnalysisResponse {
  build: {
    startItems: string[];       // item names
    firstItem: string;
    coreItems: string[];        // 3-4 items names
    boots: string;
    situational: string[];
    runes: {
      keystone: string;
      primary: string[];
      secondary: string[];
    };
    spells: string[];
  };
  analysis: string;             // markdown analysis text
}

export async function POST(req: NextRequest) {
  try {
    const body: AnalysisRequest = await req.json();
    const { yourChamp, enemyChamp, role, itemCatalog } = body;

    // Build a concise item name list for the AI to reference
    const itemNames = Object.values(itemCatalog)
      .map(i => i.name)
      .join(", ");

    const systemPrompt = `Tu es un coach League of Legends Diamond+ spécialisé dans les matchups.
Tu as une connaissance parfaite du patch actuel (patch 16.6.1, Saison 2025) et de tous les items disponibles.
Tu réponds TOUJOURS en français.
Tu dois UNIQUEMENT utiliser des items qui existent dans la liste fournie. Ne jamais inventer des items.
Les items populaires en méta actuelle incluent (selon les rôles) : Éclipse, Brèche de Serylda, Cyclosabre voltaïque, Lame de l'infini, Kraken, Sceptre ange gardien, Rabadon, Luden, Heartsteel, Triforce, etc.`;

    const userPrompt = `MATCHUP: ${yourChamp} (${role}) vs ${enemyChamp}

Items disponibles dans le patch actuel (extrait) : ${itemNames.slice(0, 2000)}

Réponds avec un JSON STRICTEMENT valide dans ce format (et RIEN d'autre avant ou après le JSON):
{
  "build": {
    "startItems": ["nom item 1", "nom item 2"],
    "firstItem": "Nom du 1er item complet à acheter",
    "coreItems": ["item 2", "item 3", "item 4"],
    "boots": "Nom des bottes",
    "situational": ["item situationnel 1 si ${enemyChamp} fed"],
    "runes": {
      "keystone": "Nom de la keystone",
      "primary": ["rune 1", "rune 2", "rune 3"],
      "secondary": ["rune 1", "rune 2"]
    },
    "spells": ["Éclair", "Ignition"]
  },
  "analysis": "## Build optimal\\n\\nExplication ici...\\n\\n## Phase de couloir (Early)\\n\\nConseils early...\\n\\n## Mid game\\n\\nConseils mid...\\n\\n## Late game\\n\\nConseils late...\\n\\n## Résumé\\n\\n- Point clé 1\\n- Point clé 2\\n- Point clé 3"
}

IMPORTANT:
- Pour ${yourChamp}, utilise les items META ACTUELS (patch 16.6.1)
- L'item "firstItem" doit être le mythique/premier item recommandé pour ce matchup spécifique
- L'analysis doit être détaillée avec les spells de ${enemyChamp} à éviter (avec leur lettre: Q/W/E/R)
- Utilise les VRAIS noms français des items tels qu'ils apparaissent dans le jeu`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 3000,
    });

    const raw = completion.choices[0]?.message?.content || "";

    // Extract JSON from response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("L'IA n'a pas retourné de JSON valide");
    }

    const parsed: AnalysisResponse = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);

  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json(
      { error: "Erreur lors de l'analyse", details: String(err) },
      { status: 500 }
    );
  }
}
