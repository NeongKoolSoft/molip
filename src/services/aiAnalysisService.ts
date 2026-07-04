import { supabase } from "@/lib/supabase";
import { getToday } from "@/services/dailyLogService";
import type { AIInsight } from "@/services/aiInsightService";

export const saveAIAnalysis = async (userId: string, result: AIInsight) => {
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

  if (error) throw error;
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

  if (error) throw error;

  return (data?.result as AIInsight) ?? null;
};

export const deleteTodayAnalysis = async (userId: string) => {
  const { error } = await supabase
    .from("ai_analyses")
    .delete()
    .eq("user_id", userId)
    .eq("log_date", getToday());

  if (error) throw error;
};