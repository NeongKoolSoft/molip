import { supabase } from "@/lib/supabase";
import { getToday } from "@/services/dailyLogService";
import type { AIInsight } from "@/services/aiInsightService";

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