export interface Keyword {
  id: string;
  key: string;
  volume: string;
  kd: string;
  timesUsed: number;
}

export interface AppState {
  mainKeywords: Keyword[];
  extraKeywords: Keyword[];
  extensionName: string;
  shortDescription: string;
  userPrompt: string;
  generatedText: string;
}


export const EXTENSION_NAME_MIN_LENGTH = 3;
export const EXTENSION_NAME_MAX_LENGTH = 75;
export const SHORT_DESC_MIN_LENGTH = 10;
export const SHORT_DESC_MAX_LENGTH = 132;

