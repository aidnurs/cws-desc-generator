export interface SingleKeyword {
  keyword: string;
  density: number;
  timesUsed: number;
  isStopword: boolean;
}

export interface KeywordPhrase {
  phrase: string;
  timesUsed: number;
}

export interface AnalysisResult {
  singleKeywords: SingleKeyword[];
  stopwords: SingleKeyword[];
  phrases: KeywordPhrase[];
  totalWords: number;
  uniqueWords: number;
}

export interface SpamRiskResult {
  risk: number;
  level: string;
  details: Array<{
    block: string;
    sum: number;
    params: Array<{
      name: string;
      value: string | number;
      score: number;
    }>;
  }>;
}

export interface AppState {
  text: string;
  analysisResult: AnalysisResult | null;
  spamRiskResult: SpamRiskResult | null;
}
