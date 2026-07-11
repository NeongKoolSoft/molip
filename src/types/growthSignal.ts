export type LogRevision = {
  id: string;
  daily_log_id: string;
  log_date: string;
  content: string;
  revision_number: number;
  source: "initial" | "manual_edit" | "reflection_edit";
  created_at: string;
};

export type GrowthSignal = {
  revisionCount: number;
  editCount: number;

  initialLength: number;
  latestLength: number;
  lengthChange: number;
  lengthChangeRate: number;

  initialSentenceCount: number;
  latestSentenceCount: number;
  sentenceChange: number;

  hasExpanded: boolean;
  summary: string;
};