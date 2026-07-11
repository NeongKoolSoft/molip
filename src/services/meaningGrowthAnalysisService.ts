import { supabase } from "@/lib/supabase";

import type { MeaningGrowth } from "@/types/meaningGrowth";

type SaveMeaningGrowthParams = {
  userId: string;
  dailyLogId: string;
  logDate: string;
  initialRevisionNumber: number;
  latestRevisionNumber: number;
  result: MeaningGrowth;
};

type MeaningGrowthAnalysisRow = {
  result: MeaningGrowth;
  initial_revision_number: number;
  latest_revision_number: number;
};

export async function saveMeaningGrowthAnalysis({
  userId,
  dailyLogId,
  logDate,
  initialRevisionNumber,
  latestRevisionNumber,
  result,
}: SaveMeaningGrowthParams): Promise<void> {
  const { error } = await supabase
    .from("meaning_growth_analyses")
    .upsert(
      {
        user_id: userId,
        daily_log_id: dailyLogId,
        log_date: logDate,
        initial_revision_number: initialRevisionNumber,
        latest_revision_number: latestRevisionNumber,
        result,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "daily_log_id",
      }
    );

  if (error) {
    throw error;
  }
}

export async function getTodayMeaningGrowthAnalysis(
  userId: string
): Promise<MeaningGrowth | null> {
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("meaning_growth_analyses")
    .select(
      `
        result,
        initial_revision_number,
        latest_revision_number
      `
    )
    .eq("user_id", userId)
    .eq("log_date", today)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const row = data as MeaningGrowthAnalysisRow | null;

  return row?.result ?? null;
}

export async function deleteTodayMeaningGrowthAnalysis(
  userId: string
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);

  const { error } = await supabase
    .from("meaning_growth_analyses")
    .delete()
    .eq("user_id", userId)
    .eq("log_date", today);

  if (error) {
    throw error;
  }
}