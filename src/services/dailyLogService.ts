import { supabase } from "@/lib/supabase";
import type { DailyLog } from "@/types/dailyLog";

export const getToday = () => {
  return new Date().toISOString().slice(0, 10);
};

export const loadTodayLog = async (userId: string) => {
  const today = getToday();

  const { data, error } = await supabase
    .from("daily_logs")
    .select("content")
    .eq("user_id", userId)
    .eq("log_date", today)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.content ?? "";
};

export const loadRecentLogs = async (
  userId: string
): Promise<DailyLog[]> => {
  const { data, error } = await supabase
    .from("daily_logs")
    .select("id, user_id, log_date, content")
    .eq("user_id", userId)
    .order("log_date", { ascending: false })
    .limit(5);

  if (error) {
    throw error;
  }

  return data ?? [];
};

export const loadTodayLogRow = async (
  userId: string
): Promise<DailyLog | null> => {
  const today = getToday();

  const { data, error } = await supabase
    .from("daily_logs")
    .select("id, user_id, log_date, content")
    .eq("user_id", userId)
    .eq("log_date", today)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
};

export const saveTodayLog = async (
  userId: string,
  content: string
): Promise<DailyLog> => {
  const today = getToday();
  const trimmedContent = content.trim();

  const { data, error } = await supabase
    .from("daily_logs")
    .upsert(
      {
        user_id: userId,
        log_date: today,
        content: trimmedContent,
      },
      {
        onConflict: "user_id,log_date",
      }
    )
    .select("id, user_id, log_date, content")
    .single();

  if (error) {
    throw error;
  }

  return data;
};