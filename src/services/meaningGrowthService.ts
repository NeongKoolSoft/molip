import { supabase } from "@/lib/supabase";

import type { MeaningGrowth } from "@/types/meaningGrowth";
import type { LogRevision } from "@/types/growthSignal";

export type MeaningGrowthRevisionContext = {
  dailyLogId: string;
  logDate: string;
  initialRevisionNumber: number;
  latestRevisionNumber: number;
  initialContent: string;
  latestContent: string;
};

export async function loadTodayMeaningGrowthRevisionContext(
  userId: string
): Promise<MeaningGrowthRevisionContext | null> {
  const today = new Date().toISOString().slice(0, 10);

  const { data: dailyLog, error: dailyLogError } = await supabase
    .from("daily_logs")
    .select("id, log_date")
    .eq("user_id", userId)
    .eq("log_date", today)
    .maybeSingle();

  if (dailyLogError) {
    throw dailyLogError;
  }

  if (!dailyLog) {
    return null;
  }

  const { data, error } = await supabase
    .from("log_revisions")
    .select(
      `
        id,
        daily_log_id,
        log_date,
        content,
        revision_number,
        source,
        created_at
      `
    )
    .eq("user_id", userId)
    .eq("daily_log_id", dailyLog.id)
    .order("revision_number", { ascending: true });

  if (error) {
    throw error;
  }

  const revisions = (data ?? []) as LogRevision[];

  if (revisions.length < 2) {
    return null;
  }

  const initialRevision = revisions[0];
  const latestRevision = revisions[revisions.length - 1];

  return {
    dailyLogId: dailyLog.id,
    logDate: dailyLog.log_date,
    initialRevisionNumber: initialRevision.revision_number,
    latestRevisionNumber: latestRevision.revision_number,
    initialContent: initialRevision.content,
    latestContent: latestRevision.content,
  };
}

export async function analyzeMeaningGrowth(
  initialContent: string,
  latestContent: string
): Promise<MeaningGrowth> {
  const response = await fetch("/api/meaning-growth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      initialContent,
      latestContent,
    }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error("Meaning Growth API 상태:", response.status);
    console.error("Meaning Growth API 원문:", responseText);

    let errorMessage = `Meaning Growth API 오류 (${response.status})`;

    try {
      const errorBody = JSON.parse(responseText);

      errorMessage =
        errorBody.detail ??
        errorBody.error ??
        errorMessage;
    } catch {
      // JSON이 아닌 Next.js 오류 응답일 수 있다.
    }

    throw new Error(errorMessage);
  }

  try {
    return JSON.parse(responseText) as MeaningGrowth;
  } catch {
    console.error(
      "Meaning Growth 성공 응답이 JSON이 아닙니다:",
      responseText
    );

    throw new Error(
      "Meaning Growth API 응답 형식이 올바르지 않습니다."
    );
  }
}