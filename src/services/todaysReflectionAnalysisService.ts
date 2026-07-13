import { supabase } from "@/lib/supabase";
import { getToday } from "@/services/dailyLogService";

import type {
  TodaysReflection,
  TodaysReflectionContext,
} from "@/types/todaysReflection";

type SaveTodaysReflectionParams = {
  userId: string;
  dailyLogId: string;
  logDate: string;
  latestRevisionNumber: number;
  result: TodaysReflection;
  context: TodaysReflectionContext;
};

type TodaysReflectionRow = {
  reflection: string;
  context: TodaysReflectionContext;
  latest_revision_number: number;
};

export async function saveTodaysReflection({
  userId,
  dailyLogId,
  logDate,
  latestRevisionNumber,
  result,
  context,
}: SaveTodaysReflectionParams): Promise<void> {
  const { error } = await supabase
    .from("todays_reflections")
    .upsert(
      {
        user_id: userId,
        daily_log_id: dailyLogId,
        log_date: logDate,
        latest_revision_number: latestRevisionNumber,
        reflection: result.reflection,
        context,
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

export async function getTodayTodaysReflection(
  userId: string
): Promise<TodaysReflection | null> {
  const { data, error } = await supabase
    .from("todays_reflections")
    .select("reflection")
    .eq("user_id", userId)
    .eq("log_date", getToday())
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.reflection) {
    return null;
  }

  return {
    reflection: data.reflection,
  };
}

export async function getTodayTodaysReflectionRow(
  userId: string
): Promise<TodaysReflectionRow | null> {
  const { data, error } = await supabase
    .from("todays_reflections")
    .select(
      `
        reflection,
        context,
        latest_revision_number
      `
    )
    .eq("user_id", userId)
    .eq("log_date", getToday())
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as TodaysReflectionRow | null) ?? null;
}

export async function deleteTodayTodaysReflection(
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("todays_reflections")
    .delete()
    .eq("user_id", userId)
    .eq("log_date", getToday());

  if (error) {
    throw error;
  }
}