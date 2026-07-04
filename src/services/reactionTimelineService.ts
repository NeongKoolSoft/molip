import { supabase } from "@/lib/supabase";

export type ReactionTimelineItem = {
  date: string;
  target: string;
  type: string;
  weight: number;
  evidence: string;
};

export type ReactionTimelineGroup = {
  target: string;
  items: ReactionTimelineItem[];
};

type ReactionTarget = {
  normalized_target: string;
  type: string;
  weight: number;
  evidence: string;
};

type AIAnalysisRow = {
  log_date: string;
  result: {
    reaction_targets?: ReactionTarget[];
  };
};

export async function loadReactionTimeline(
  userId: string
): Promise<ReactionTimelineGroup[]> {
  const { data, error } = await supabase
    .from("ai_analyses")
    .select("log_date, result")
    .eq("user_id", userId)
    .order("log_date", { ascending: true })
    .limit(14);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as AIAnalysisRow[];

  const items: ReactionTimelineItem[] = rows.flatMap((row) => {
    const targets = row.result?.reaction_targets ?? [];

    return targets
      .filter(
        (target) =>
          target.normalized_target &&
          target.type &&
          typeof target.weight === "number"
      )
      .map((target) => ({
        date: row.log_date,
        target: target.normalized_target,
        type: target.type,
        weight: target.weight,
        evidence: target.evidence,
      }));
  });

  const grouped = new Map<string, ReactionTimelineItem[]>();

  items.forEach((item) => {
    const current = grouped.get(item.target) ?? [];
    current.push(item);
    grouped.set(item.target, current);
  });

  return Array.from(grouped.entries())
    .map(([target, items]) => ({
      target,
      items,
    }))
    .sort((a, b) => b.items.length - a.items.length);
}