"use client";

import { useEffect, useState } from "react";

import type { DailyLog } from "@/types/dailyLog";
import type { AIInsight } from "@/services/aiInsightService";

import {
  getTodayAnalysis,
  saveAIAnalysis,
} from "@/services/aiAnalysisService";

import {
  analyzeMeaningGrowth,
  loadTodayMeaningGrowthRevisionContext,
} from "@/services/meaningGrowthService";

import {
  getTodayMeaningGrowthAnalysis,
  saveMeaningGrowthAnalysis,
} from "@/services/meaningGrowthAnalysisService";

import {
  generateTodaysReflection,
  loadTodaysReflectionContext,
} from "@/services/todaysReflectionService";

import {
  getTodayTodaysReflection,
  saveTodaysReflection,
} from "@/services/todaysReflectionAnalysisService";

type LegacyAIInsight = AIInsight & {
  question?: string;
};

type AIInsightCardProps = {
  userId: string;
  logs: DailyLog[];
  refreshKey: number;
  onAnalysisComplete: () => void;
  onMeaningGrowthComplete: () => void;
  onTodaysReflectionComplete: () => void;
};

const typeLabels: Record<string, string> = {
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

export default function AIInsightCard({
  userId,
  logs,
  refreshKey,
  onAnalysisComplete,
  onMeaningGrowthComplete,
  onTodaysReflectionComplete,
}: AIInsightCardProps) {
  const [insight, setInsight] =
    useState<LegacyAIInsight | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const todayLogs = logs.filter(
    (log) => log.log_date === today
  );

  const ensureMeaningGrowth = async () => {
    const cachedMeaningGrowth =
      await getTodayMeaningGrowthAnalysis(userId);

    if (cachedMeaningGrowth) {
      return;
    }

    const context =
      await loadTodayMeaningGrowthRevisionContext(userId);

    if (!context) {
      return;
    }

    const meaningGrowth = await analyzeMeaningGrowth(
      context.initialContent,
      context.latestContent
    );

    await saveMeaningGrowthAnalysis({
      userId,
      dailyLogId: context.dailyLogId,
      logDate: context.logDate,
      initialRevisionNumber:
        context.initialRevisionNumber,
      latestRevisionNumber:
        context.latestRevisionNumber,
      result: meaningGrowth,
    });

    onMeaningGrowthComplete();
  };

  const ensureTodaysReflection = async () => {
    const cachedReflection =
      await getTodayTodaysReflection(userId);

    if (cachedReflection) {
      return;
    }

    const context =
      await loadTodaysReflectionContext(userId);

    if (
      !context.dailyLogId ||
      !context.latestRevisionNumber
    ) {
      return;
    }

    const result =
      await generateTodaysReflection(context);

    await saveTodaysReflection({
      userId,
      dailyLogId: context.dailyLogId,
      logDate: context.logDate,
      latestRevisionNumber:
        context.latestRevisionNumber,
      result,
      context,
    });

    onTodaysReflectionComplete();
  };

  const createDerivedAnalyses = async () => {
    await ensureMeaningGrowth();
    await ensureTodaysReflection();
  };

  const handleAnalyze = async () => {
    setInsight(null);
    setLoading(true);
    setMessage("");

    try {
      const cached =
        await getTodayAnalysis(userId);

      if (cached) {
        setInsight(cached);
        onAnalysisComplete();

        try {
          await createDerivedAnalyses();
        } catch (derivedError) {
          console.error(
            "파생 분석 생성 오류:",
            derivedError
          );

          setMessage(
            "기본 AI 분석은 불러왔지만, 생각의 흐름을 만드는 중 일부 오류가 발생했습니다."
          );
        }

        return;
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          logs: todayLogs,
        }),
      });

      if (!response.ok) {
        const responseText =
          await response.text();

        console.error(
          "AI 분석 API 오류:",
          response.status,
          responseText
        );

        throw new Error("AI 분석 실패");
      }

      const data: AIInsight =
        await response.json();

      setInsight(data);

      await saveAIAnalysis(userId, data);

      onAnalysisComplete();

      try {
        await createDerivedAnalyses();
      } catch (derivedError) {
        console.error(
          "파생 분석 생성 오류:",
          derivedError
        );

        setMessage(
          "AI 분석은 완료됐지만, 생각의 흐름을 만드는 중 일부 오류가 발생했습니다."
        );
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "AI 분석 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setInsight(null);

    const loadCachedAnalysis = async () => {
      try {
        const cached =
          await getTodayAnalysis(userId);

        if (cached) {
          setInsight(cached);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadCachedAnalysis();
  }, [userId, refreshKey]);

  const reflectionQuestion =
    insight?.reflection_question ??
    insight?.question ??
    "최근 가장 오래 마음에 남은 반응은 무엇이었고, 왜 그랬을까요?";

  return (
    <section className="mt-10 rounded-3xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold text-gray-950">
          AI가 발견한 나의 변화
        </h2>

        <span
          aria-hidden="true"
          className="text-xl"
        >
          ✨
        </span>
      </div>

      <p className="mt-4 leading-8 text-gray-700">
        최근 기록을 기반으로
        <br />
        반복되는 반응 대상과 몰입 신호를 분석합니다.
      </p>

      <button
        type="button"
        onClick={handleAnalyze}
        disabled={
          loading || todayLogs.length === 0
        }
        className="mt-6 w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
      >
        {loading
          ? "분석 중..."
          : "✨ AI 분석하기"}
      </button>

      {message && (
        <p className="mt-4 text-sm text-red-500">
          {message}
        </p>
      )}

      {insight && (
        <div className="mt-6 rounded-2xl bg-white p-4 text-sm leading-6 text-gray-700 shadow-sm sm:p-5">
          <h3 className="text-lg font-bold text-gray-900">
            반응 대상
          </h3>

          <div className="mt-4 space-y-4">
            {insight.reaction_targets
              .filter(
                (item) =>
                  item &&
                  item.target &&
                  item.normalized_target &&
                  typeof item.weight === "number"
              )
              .map((item) => (
                <article
                  key={`${item.target}-${item.type}`}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-base font-bold text-gray-900">
                      {item.normalized_target}
                    </p>

                    <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {typeLabels[item.type] ??
                        item.type}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    원문 표현: {item.target}
                  </p>

                  <p className="mt-2 font-medium text-gray-800">
                    {item.evidence}
                  </p>

                  <p className="mt-3 text-xs text-gray-500">
                    반응 강도{" "}
                    <span className="font-semibold text-blue-600">
                      {Math.round(
                        item.weight * 100
                      )}
                      %
                    </span>
                  </p>
                </article>
              ))}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-2xl">
                💜
              </div>

              <div>
                <p className="text-gray-500">전체 감정</p>

                <p className="mt-1 text-base font-bold text-gray-900">
                  {insight.overall_emotion}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-2xl">
                ⚡
              </div>

              <div>
                <p className="text-gray-500">에너지</p>

                <p className="mt-1 text-base font-bold text-gray-900">
                  {insight.overall_energy}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-2xl">
                💧
              </div>

              <div>
                <p className="text-gray-500">몰입 신호</p>

                <p className="mt-1 text-base font-bold text-cyan-600">
                  {Math.round(insight.immersion_score * 100)}%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-2xl">
                🛡️
              </div>

              <div>
                <p className="text-gray-500">분석 신뢰도</p>

                <p className="mt-1 text-base font-bold text-green-600">
                  {Math.round(insight.confidence * 100)}%
                </p>
              </div>
            </div>
          </div>          

          <div className="mt-7">
            <h3 className="text-lg font-bold text-gray-900">
              요약
            </h3>

            <p className="mt-3 leading-7 text-gray-700">
              {insight.summary}
            </p>
          </div>

          <div className="mt-7 rounded-2xl border-2 border-violet-400 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-5 shadow-lg shadow-violet-100">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xl shadow-md">
                🤔
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold tracking-tight text-violet-700">
                    잠시 돌아보기
                  </h3>

                  <span
                    aria-hidden="true"
                    className="text-violet-500"
                  >
                    ✨
                  </span>
                </div>

                <p className="mt-4 break-keep text-lg font-bold leading-8 text-gray-950">
                  {reflectionQuestion}
                </p>
              </div>

            </div>
          </div>
        </div>
      )}
    </section>
  );
}