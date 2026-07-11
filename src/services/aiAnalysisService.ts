import { supabase } from "@/lib/supabase";
import { getToday } from "@/services/dailyLogService";
import type { AIInsight } from "@/services/aiInsightService";

export type DatedAIAnalysis = {
  logDate: string;
  result: AIInsight;
};

export const saveAIAnalysis = async (
  userId: string,
  result: AIInsight
) => {
  const { error } = await supabase.from("ai_analyses").upsert(
    {
      user_id: userId,
      log_date: getToday(),
      result,
    },
    {
      onConflict: "user_id,log_date",
    }
  );

  if (error) {
    throw error;
  }
};

export const getTodayAnalysis = async (
  userId: string
): Promise<AIInsight | null> => {
  const { data, error } = await supabase
    .from("ai_analyses")
    .select("result")
    .eq("user_id", userId)
    .eq("log_date", getToday())
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data?.result as AIInsight) ?? null;
};

export const getRecentAnalyses = async (
  userId: string,
  days = 7
): Promise<DatedAIAnalysis[]> => {
  const endDate = new Date();
  const startDate = new Date();

  startDate.setDate(endDate.getDate() - (days - 1));

  const startDateText = startDate.toISOString().slice(0, 10);
  const endDateText = endDate.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("ai_analyses")
    .select("log_date, result")
    .eq("user_id", userId)
    .gte("log_date", startDateText)
    .lte("log_date", endDateText)
    .order("log_date", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    logDate: row.log_date,
    result: row.result as AIInsight,
  }));
};

export const deleteTodayAnalysis = async (userId: string) => {
  const { error } = await supabase
    .from("ai_analyses")
    .delete()
    .eq("user_id", userId)
    .eq("log_date", getToday());

  if (error) {
    throw error;
  }
};