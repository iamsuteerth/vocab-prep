export type Word = {
  id: string;
  word: string;
  type: string;
  category: string;
  definition: string;
  usage: string;
  memoryCue: string;
};

export type WordStatus = "new" | "know" | "dontKnow";

export type ProgressData = {
  version: 1;
  statuses: Record<string, WordStatus>;
  bookmarks: string[];
  seen: string[];
};

export const EMPTY_PROGRESS: ProgressData = {
  version: 1,
  statuses: {},
  bookmarks: [],
  seen: [],
};
