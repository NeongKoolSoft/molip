"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { UserPlan } from "@/types/userPlan";
import type { WeeklyReport } from "@/types/weeklyReport";

import {
  generateWeeklyReport,
  loadWeeklyReportContext,
} from "@/services/weeklyReportService";

import {
  deleteTodayWeeklyReport,
  getTodayWeeklyReport,
  saveWeeklyReport,
} from "@/services/weeklyReportAnalysisService";

type Props = {
  userId: string;
  plan: UserPlan;
  refreshKey: number;
};

const typeLabel: Record<string, string> = {
  interest: "관심",
  desire: "욕구",
  avoidance: "회피",
  burden: "부담",
  joy: "즐거움",
  regret: "아쉬움",
  immersion: "몰입",
  concern: "걱정",
  energy: "에너지",
};

const growthLabel = {
  up: "커지고 있음",
  down: "작아지고 있음",
  stable: "비슷하게 이어짐",
};

const formatDate = (value: string): string => {
  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${Number(month)}월 ${Number(day)}일`;
};

export default function WeeklyReportCard({
  userId,
  plan,
  refreshKey,
}: Props) {
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(plan === "plus");
  const [errorMessage, setErrorMessage] = useState("");

  const previousRequestRef = useRef({
    userId,
    refreshKey,
  });

  useEffect(() => {
    let isMounted = true;

    const previousRequest = previousRequestRef.current;

    const shouldRegenerate =
        previousRequest.userId === userId &&
        previousRequest.refreshKey !== refreshKey;

    previousRequestRef.current = {
        userId,
        refreshKey,
    };

    if (plan !== "plus") {
        return () => {
            isMounted = false;
        };
    }

    const load = async () => {
        setLoading(true);
        setErrorMessage("");

        try {
            if (shouldRegenerate) {
                await deleteTodayWeeklyReport(userId);
            }

            const savedReport = await getTodayWeeklyReport(userId);

            if (!isMounted) {
                return;
            }

            if (savedReport) {
                setReport(savedReport);
                return;
            }

            const context = await loadWeeklyReportContext(userId);

            if (!isMounted) {
                return;
            }

            const generatedReport =
                await generateWeeklyReport(context);

            if (!isMounted) {
                return;
            }

            await saveWeeklyReport({
                userId,
                report: generatedReport,
            });

            if (!isMounted) {
                return;
            }

            setReport(generatedReport);
        } catch (error) {
            console.error("Weekly Report 조회 실패:", error);

            if (!isMounted) {
                return;
            }

            setReport(null);

            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "주간 리포트를 불러오지 못했습니다."
            );
        } finally {
            if (isMounted) {
                setLoading(false);
            }
        }
    };

    load();

    return () => {
        isMounted = false;
    };
    }, [userId, plan, refreshKey]);

  if (plan !== "plus") {
    return (
      <section className="mt-10 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <Link
        href="/plus"
        className="mt-5 block rounded-xl border border-indigo-100 bg-white p-4 transition hover:border-indigo-200 hover:bg-indigo-50"
        >
        <div className="flex items-center justify-between gap-3">
            <div>
            <p className="font-semibold text-gray-900">
                Molip Plus에서 이용할 수 있습니다.
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-600">
                최근 7일의 흐름과 가장 강한 반복 신호를 함께
                확인해 보세요.
            </p>
            </div>

            <span
            aria-hidden="true"
            className="shrink-0 font-bold text-indigo-600"
            >
            →
            </span>
        </div>
        </Link>        
      </section>
    );
  }

  if (loading) {
    return (
      <section className="mt-10 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <p className="text-sm text-gray-500">
          최근 7일의 기록을 하나의 흐름으로 연결하고 있습니다.
        </p>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="mt-10 rounded-2xl border border-red-100 bg-red-50 p-5">
        <h2 className="text-xl font-bold">
          최근 7일 리포트
        </h2>

        <p className="mt-3 leading-7 text-red-700">
          {errorMessage}
        </p>
      </section>
    );
  }

  if (!report) {
    return null;
  }

  if (report.status === "not_ready") {
    return (
      <section className="mt-10 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-indigo-700">
              Plus
            </p>

            <h2 className="mt-2 text-xl font-bold">
              최근 7일 리포트
            </h2>
          </div>

          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-700">
            {report.recordedDays}일 기록
          </span>
        </div>

        <p className="mt-3 text-sm text-gray-500">
          {formatDate(report.periodStart)} ~{" "}
          {formatDate(report.periodEnd)}
        </p>

        <p className="mt-5 leading-7 text-gray-700">
          {report.summary}
        </p>

        <p className="mt-4 rounded-xl border border-indigo-100 bg-white p-4 leading-7 text-gray-600">
          {report.reflection}
        </p>
      </section>
    );
  }

  return (
    <section className="mt-10 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-indigo-700">
            Plus
          </p>

          <h2 className="mt-2 text-xl font-bold">
            최근 7일 리포트
          </h2>
        </div>

        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-700">
          {report.recordedDays}일 기록
        </span>
      </div>

      <p className="mt-3 text-sm text-gray-500">
        {formatDate(report.periodStart)} ~{" "}
        {formatDate(report.periodEnd)}
      </p>

      <div className="mt-6 rounded-2xl border border-indigo-100 bg-white p-5">
        <p className="text-xs font-semibold text-indigo-700">
          이번 주 한 줄
        </p>

        <p className="mt-3 text-lg font-bold leading-8 text-gray-900">
          {report.summary}
        </p>
      </div>

      {report.primarySignal && (
        <div className="mt-6">
          <h3 className="text-lg font-bold">
            가장 강했던 반복 신호
          </h3>

          <div className="mt-3 rounded-2xl border border-indigo-100 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xl font-bold">
                  {report.primarySignal.target}
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  최근 7일 동안{" "}
                  {report.primarySignal.frequency}회 등장
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                {typeLabel[
                  report.primarySignal.dominantType
                ] ?? report.primarySignal.dominantType}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-xs text-gray-500">
                  평균 반응
                </p>

                <p className="mt-1 font-bold">
                  {Math.round(
                    report.primarySignal.averageWeight * 100
                  )}
                  %
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-xs text-gray-500">
                  변화
                </p>

                <p className="mt-1 font-bold">
                  {
                    growthLabel[
                      report.primarySignal.growthDirection
                    ]
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {report.meaningChange && (
        <div className="mt-6">
          <h3 className="text-lg font-bold">
            이번 주 의미 변화
          </h3>

          <div className="mt-3 rounded-2xl border border-indigo-100 bg-white p-5">
            <p className="leading-7 text-gray-700">
              {report.meaningChange.summary}
            </p>

            {report.meaningChange.addedMeanings.length > 0 && (
              <ul className="mt-4 space-y-2">
                {report.meaningChange.addedMeanings.map(
                  (meaning) => (
                    <li
                      key={meaning}
                      className="flex gap-3 text-sm leading-6 text-gray-600"
                    >
                      <span
                        aria-hidden="true"
                        className="font-bold text-indigo-600"
                      >
                        +
                      </span>

                      <span>{meaning}</span>
                    </li>
                  )
                )}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-bold">
          이번 주 돌아보기
        </h3>

        <div className="mt-3 rounded-2xl border border-indigo-100 bg-white p-5">
          <p className="leading-7 text-gray-700">
            {report.reflection}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
        <p className="text-sm font-semibold text-green-800">
          한 번 더 돌아보기
        </p>

        <p className="mt-3 text-lg font-semibold leading-8 text-gray-900">
          {report.nextQuestion}
        </p>
      </div>
    </section>
  );
}