import { supabase } from "@/lib/supabase";
import { getToday } from "@/services/dailyLogService";
import type { AIInsight } from "@/services/aiInsightService";

export type DatedAIAnalysis = {
  logDate: string;
  result: AIInsight;
};

const formatSeoulDate = (
  date: Date
): string => {
  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Asia/Seoul",
    }
  ).format(date);
};

const getSeoulDateRange = (
  days: number
): {
  startDate: string;
  endDate: string;
} => {
  const safeDays = Math.max(
    1,
    Math.floor(days)
  );

  const now = new Date();

  const seoulDateParts =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }
    ).formatToParts(now);

  const year = Number(
    seoulDateParts.find(
      (part) =>
        part.type === "year"
    )?.value
  );

  const month = Number(
    seoulDateParts.find(
      (part) =>
        part.type === "month"
    )?.value
  );

  const day = Number(
    seoulDateParts.find(
      (part) =>
        part.type === "day"
    )?.value
  );

  const endDate = new Date(
    Date.UTC(
      year,
      month - 1,
      day
    )
  );

  const startDate = new Date(
    endDate
  );

  startDate.setUTCDate(
    endDate.getUTCDate() -
      (safeDays - 1)
  );

  return {
    startDate:
      startDate
        .toISOString()
        .slice(0, 10),

    endDate:
      endDate
        .toISOString()
        .slice(0, 10),
  };
};

export const saveAIAnalysis = async (
  userId: string,
  result: AIInsight
) => {
  const { error } =
    await supabase
      .from("ai_analyses")
      .upsert(
        {
          user_id: userId,
          log_date: getToday(),
          result,
        },
        {
          onConflict:
            "user_id,log_date",
        }
      );

  if (error) {
    throw error;
  }
};

export const getTodayAnalysis = async (
  userId: string
): Promise<AIInsight | null> => {
  const { data, error } =
    await supabase
      .from("ai_analyses")
      .select("result")
      .eq("user_id", userId)
      .eq(
        "log_date",
        getToday()
      )
      .maybeSingle();

  if (error) {
    throw error;
  }

  return (
    (data?.result as AIInsight) ??
    null
  );
};

export const getRecentAnalyses = async (
  userId: string,
  days = 7
): Promise<
  DatedAIAnalysis[]
> => {
  const {
    startDate,
    endDate,
  } =
    getSeoulDateRange(
      days
    );

  const { data, error } =
    await supabase
      .from("ai_analyses")
      .select(
        "log_date, result"
      )
      .eq("user_id", userId)
      .gte(
        "log_date",
        startDate
      )
      .lte(
        "log_date",
        endDate
      )
      .order(
        "log_date",
        {
          ascending: true,
        }
      );

  if (error) {
    throw error;
  }

  return (
    data ?? []
  ).map((row) => ({
    logDate:
      row.log_date,

    result:
      row.result as AIInsight,
  }));
};

export const deleteTodayAnalysis =
  async (
    userId: string
  ) => {
    const { error } =
      await supabase
        .from("ai_analyses")
        .delete()
        .eq(
          "user_id",
          userId
        )
        .eq(
          "log_date",
          getToday()
        );

    if (error) {
      throw error;
    }
  };