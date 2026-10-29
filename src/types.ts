export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface LanguageConfig {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  sampleGreeting: string;
  defaultVoice: string;
  voices: { id: string; name: string; description: string; gender: string }[];
}

export interface Scenario {
  id: string;
  title: string;
  category: 'daily' | 'travel' | 'work' | 'social' | 'emergency' | 'culture';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: string;
  description: string;
  partnerRole: string;
  userRole: string;
  starterPrompt: string;
  missions: string[];
  suggestedPhrases: { target: string; english: string; phonetic?: string }[];
  culturalNote?: string;
  languagePhrases?: Record<string, { target: string; english: string; phonetic?: string }[]>;
}

export interface LiveTranscript {
  id: string;
  speaker: 'user' | 'ai';
  text: string;
  timestamp: number;
  translation?: string;
  feedback?: CoachFeedback;
}

export interface CoachFeedback {
  isAccurate: boolean;
  naturalAlternative?: string;
  englishTranslation?: string;
  grammarCorrection?: string | null;
  vocabularyBoost?: string | null;
  praise?: string;
}

export interface SessionReport {
  estimatedCEFR: string;
  fluencyScore: number;
  accuracyScore: number;
  vocabularyRichnessScore: number;
  overallFeedback: string;
  keyStrengths: string[];
  areasToImprove: string[];
  mistakesAndCorrections: {
    original: string;
    corrected: string;
    explanation: string;
  }[];
  vocabularyLearned: {
    word: string;
    meaning: string;
    example: string;
  }[];
  nextMissionRecommendation: string;
}

export interface UserProgress {
  totalMinutes: number;
  sessionsCompleted: number;
  streakDays: number;
  savedVocabulary: { word: string; meaning: string; language: string; date: string }[];
}
