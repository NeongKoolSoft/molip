import { supabase } from "@/lib/supabase";

import { getRecentAnalyses } from "@/services/aiAnalysisService";
import { loadImmersionDiscoveryV2 } from "@/services/immersionDiscoveryV2Service";

import type { AIInsight } from "@/services/aiInsightService";
import type { ImmersionDiscoveryV2 } from "@/types/immersionDiscoveryV2";
import type { WeeklyReport } from "@/types/weeklyReport";

export type WeeklyAnalysisItem = {
  logDate: string;
  result: AIInsight;
};

export type WeeklyReportContext = {
  periodStart: string;
  periodEnd: string;
  recordedDays: number;

  analyses: WeeklyAnalysisItem[];
  immersionDiscovery: ImmersionDiscoveryV2;
};

const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getWeeklyPeriod = (): {
  periodStart: string;
  periodEnd: string;
} => {
  const endDate = new Date();
  const startDate = new Date(endDate);

  startDate.setDate(endDate.getDate() - 6);

  return {
    periodStart: formatLocalDate(startDate),
    periodEnd: formatLocalDate(endDate),
  };
};

const loadRecordedDays = async (
  userId: string,
  periodStart: string,
  periodEnd: string
): Promise<number> => {
  const { data, error } = await supabase
    .from("daily_logs")
    .select("log_date")
    .eq("user_id", userId)
    .gte("log_date", periodStart)
    .lte("log_date", periodEnd);

  if (error) {
    throw error;
  }

  const uniqueDates = new Set(
    (data ?? [])
      .map((item) => item.log_date)
      .filter(
        (logDate): logDate is string =>
          typeof logDate === "string" && logDate.length > 0
      )
  );

  return uniqueDates.size;
};

export const loadWeeklyReportContext = async (
  userId: string
): Promise<WeeklyReportContext> => {
  const { periodStart, periodEnd } = getWeeklyPeriod();

  const [
    analyses,
    immersionDiscovery,
    recordedDays,
  ] = await Promise.all([
    getRecentAnalyses(userId, 7),
    loadImmersionDiscoveryV2(userId, 7),
    loadRecordedDays(userId, periodStart, periodEnd),
  ]);

  return {
    periodStart,
    periodEnd,
    recordedDays,

    analyses: analyses.map((analysis) => ({
      logDate: analysis.logDate,
      result: analysis.result,
    })),

    immersionDiscovery,
  };
};

export const createEmptyWeeklyReport = (
  context: WeeklyReportContext
): WeeklyReport => {
  return {
    status: "not_ready",

    periodStart: context.periodStart,
    periodEnd: context.periodEnd,
    recordedDays: context.recordedDays,

    summary: "",
    primarySignal: null,
    meaningChange: null,
    reflection: "",
    nextQuestion: "",
  };
};

export const generateWeeklyReport = async (
  context: WeeklyReportContext
): Promise<WeeklyReport> => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (!session?.access_token) {
    throw new Error("로그인 정보가 없습니다.");
  }

  const response = await fetch("/api/weekly-report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      context,
    }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error(
      "Weekly Report API 상태:",
      response.status
    );
    console.error(
      "Weekly Report API 원문:",
      responseText
    );

    let errorMessage =
      `Weekly Report API 오류 (${response.status})`;

    try {
      const errorBody = JSON.parse(responseText);

      errorMessage =
        errorBody.detail ??
        errorBody.error ??
        errorMessage;
    } catch {
      // HTML 오류 응답일 수 있다.
    }

    throw new Error(errorMessage);
  }

  try {
    return JSON.parse(responseText) as WeeklyReport;
  } catch {
    console.error(
      "Weekly Report 응답이 JSON이 아닙니다:",
      responseText
    );

    throw new Error(
      "Weekly Report 응답 형식이 올바르지 않습니다."
    );
  }
};