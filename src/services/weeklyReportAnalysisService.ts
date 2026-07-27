import { supabase } from "@/lib/supabase";

import type { WeeklyReport } from "@/types/weeklyReport";

type WeeklyReportRow = {
  report: WeeklyReport;
  report_date: string;
  period_start: string;
  period_end: string;
  recorded_days: number;
  created_at: string;
  updated_at: string;
};

type SaveWeeklyReportParams = {
  userId: string;
  report: WeeklyReport;
};

const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getTodayReportDate = (): string => {
  return formatLocalDate(new Date());
};

export const getTodayWeeklyReport = async (
  userId: string
): Promise<WeeklyReport | null> => {
  const reportDate = getTodayReportDate();

  const { data, error } = await supabase
    .from("weekly_reports")
    .select("report")
    .eq("user_id", userId)
    .eq("report_date", reportDate)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.report) {
    return null;
  }

  return data.report as WeeklyReport;
};

export const getTodayWeeklyReportRow = async (
  userId: string
): Promise<WeeklyReportRow | null> => {
  const reportDate = getTodayReportDate();

  const { data, error } = await supabase
    .from("weekly_reports")
    .select(
      `
        report,
        report_date,
        period_start,
        period_end,
        recorded_days,
        created_at,
        updated_at
      `
    )
    .eq("user_id", userId)
    .eq("report_date", reportDate)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as WeeklyReportRow | null) ?? null;
};

export const saveWeeklyReport = async ({
  userId,
  report,
}: SaveWeeklyReportParams): Promise<void> => {
  const reportDate = getTodayReportDate();

  const { error } = await supabase
    .from("weekly_reports")
    .upsert(
      {
        user_id: userId,
        report_date: reportDate,

        period_start: report.periodStart,
        period_end: report.periodEnd,
        recorded_days: report.recordedDays,

        report,

        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,report_date",
      }
    );

  if (error) {
    throw error;
  }
};

export const deleteTodayWeeklyReport = async (
  userId: string
): Promise<void> => {
  const reportDate = getTodayReportDate();

  const { error } = await supabase
    .from("weekly_reports")
    .delete()
    .eq("user_id", userId)
    .eq("report_date", reportDate);

  if (error) {
    throw error;
  }
};