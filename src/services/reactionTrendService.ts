import { supabase } from "@/lib/supabase";

export type ReactionTrend = {
  target: string;
  count: number;
  avgWeight: number;
  trend: "increasing" | "stable" | "decreasing";
};

type ReactionTarget = {
  normalized_target: string;
  weight: number;
};

type AIAnalysisRow = {
  log_date: string;
  result: {
    reaction_targets?: ReactionTarget[];
  };
};

export async function loadReactionTrends(userId: string): Promise<ReactionTrend[]> {
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

  const grouped = new Map<string, { weights: number[]; dates: string[] }>();

  rows.forEach((row) => {
    const targets = row.result?.reaction_targets ?? [];

    targets.forEach((target) => {
      if (!target.normalized_target || typeof target.weight !== "number") {
        return;
      }

      const current = grouped.get(target.normalized_target) ?? {
        weights: [],
        dates: [],
      };

      current.weights.push(target.weight);
      current.dates.push(row.log_date);

      grouped.set(target.normalized_target, current);
    });
  });

  return Array.from(grouped.entries())
    .map(([target, value]) => {
      const count = value.weights.length;
      const avgWeight =
        value.weights.reduce((sum, weight) => sum + weight, 0) / count;

      const first = value.weights[0];
      const last = value.weights[value.weights.length - 1];

      let trend: ReactionTrend["trend"] = "stable";

      if (count >= 2) {
        if (last - first >= 0.1) trend = "increasing";
        else if (first - last >= 0.1) trend = "decreasing";
      }

      return {
        target,
        count,
        avgWeight,
        trend,
      };
    })
    .sort((a, b) => b.avgWeight - a.avgWeight)
    .slice(0, 5);
}