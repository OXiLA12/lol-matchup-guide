// Shared types used by both server API routes and client components

export interface ItemData {
  id: string;
  name: string;
  description: string;
  image: string;
  gold: number;
  tags: string[];
}

export interface AnalysisResponse {
  matchup: {
    winrate: number;
    difficulty: "Facile" | "Moyen" | "Difficile" | "Très difficile";
    difficultyScore: number;
    advantage: "Avantage" | "Neutre" | "Désavantage";
    tip: string;
  };
  build: {
    startItems: string[];
    firstItem: string;
    coreItems: string[];
    boots: string;
    antiHeal: string[];
    situational: string[];
    runes: {
      keystone: string;
      primary: string[];
      secondary: string[];
    };
    spells: string[];
  };
  analysis: string;
}
