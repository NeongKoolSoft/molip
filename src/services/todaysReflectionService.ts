import { getToday } from "@/services/dailyLogService";
import { getTodayAnalysis } from "@/services/aiAnalysisService";
import { loadTodayGrowthSignal } from "@/services/growthSignalService";
import { getTodayMeaningGrowthAnalysis } from "@/services/meaningGrowthAnalysisService";
import { loadImmersionTargetEvidence } from "@/services/immersionDiscoveryService";
import { composeTodaysReflectionContext } from "@/services/todaysReflectionComposer";
import { supabase } from "@/lib/supabase";

import type {
  TodaysReflection,
  TodaysReflectionContext,
} from "@/types/todaysReflection";

export async function loadTodaysReflectionContext(
  userId: string
): Promise<TodaysReflectionContext> {
  const today = getToday();

  const [
    aiInsight,
    growthSignal,
    meaningGrowth,
    immersionTargets,
    dailyLogResult,
  ] = await Promise.all([
    getTodayAnalysis(userId),
    loadTodayGrowthSignal(userId),
    getTodayMeaningGrowthAnalysis(userId),
    loadImmersionTargetEvidence(userId, 7),

    supabase
      .from("daily_logs")
      .select("id")
      .eq("user_id", userId)
      .eq("log_date", today)
      .maybeSingle(),
  ]);

  if (dailyLogResult.error) {
    throw dailyLogResult.error;
  }

  const dailyLogId = dailyLogResult.data?.id ?? null;

  let latestRevisionNumber: number | null = null;

  if (dailyLogId) {
    const { data: latestRevision, error: revisionError } =
      await supabase
        .from("log_revisions")
        .select("revision_number")
        .eq("user_id", userId)
        .eq("daily_log_id", dailyLogId)
        .order("revision_number", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (revisionError) {
      throw revisionError;
    }

    latestRevisionNumber =
      latestRevision?.revision_number ?? null;
  }

  return composeTodaysReflectionContext({
    dailyLogId,
    logDate: today,
    latestRevisionNumber,
    aiInsight,
    growthSignal,
    meaningGrowth,
    immersionTargets,
  });
}

export async function generateTodaysReflection(
  context: TodaysReflectionContext
): Promise<TodaysReflection> {
  const response = await fetch("/api/todays-reflection", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ context }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error("Today's Reflection API 상태:", response.status);
    console.error("Today's Reflection API 원문:", responseText);

    let errorMessage = `Today's Reflection API 오류 (${response.status})`;

    try {
      const errorBody = JSON.parse(responseText);

      errorMessage =
        errorBody.detail ??
        errorBody.error ??
        errorMessage;
    } catch {
      // Next.js가 HTML 오류 페이지를 반환했을 수 있다.
    }

    throw new Error(errorMessage);
  }

  try {
    return JSON.parse(responseText) as TodaysReflection;
  } catch {
    console.error(
      "Today's Reflection 응답이 JSON이 아닙니다:",
      responseText
    );

    throw new Error(
      "Today's Reflection 응답 형식이 올바르지 않습니다."
    );
  }
}