"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  DailyLog,
} from "@/types/dailyLog";

import type {
  AIInsight,
} from "@/services/aiInsightService";

import {
  getToday,
} from "@/services/dailyLogService";

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

type AIInsightCardProps = {
  userId: string;
  logs: DailyLog[];
  refreshKey: number;
  analysisRequestKey: number;
  onAnalysisComplete: () => void;
  onMeaningGrowthComplete: () => void;
  onTodaysReflectionComplete: () => void;
};

const typeLabels: Record<
  string,
  string
> = {
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
  analysisRequestKey,
  onAnalysisComplete,
  onMeaningGrowthComplete,
  onTodaysReflectionComplete,
}: AIInsightCardProps) {
  const [
    insight,
    setInsight,
  ] = useState<AIInsight | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    showAllReactionTargets,
    setShowAllReactionTargets,
  ] = useState(false);

  const lastHandledRequestKeyRef =
    useRef(0);

  const today =
    getToday();

  const todayLogs =
    logs.filter(
      (log) =>
        log.log_date === today
    );

  const ensureMeaningGrowth =
    async () => {
      const cachedMeaningGrowth =
        await getTodayMeaningGrowthAnalysis(
          userId
        );

      if (cachedMeaningGrowth) {
        return;
      }

      const context =
        await loadTodayMeaningGrowthRevisionContext(
          userId
        );

      if (!context) {
        return;
      }

      const meaningGrowth =
        await analyzeMeaningGrowth(
          context.initialContent,
          context.latestContent
        );

      await saveMeaningGrowthAnalysis({
        userId,
        dailyLogId:
          context.dailyLogId,
        logDate:
          context.logDate,
        initialRevisionNumber:
          context.initialRevisionNumber,
        latestRevisionNumber:
          context.latestRevisionNumber,
        result:
          meaningGrowth,
      });

      onMeaningGrowthComplete();
    };

  const ensureTodaysReflection =
    async () => {
      const cachedReflection =
        await getTodayTodaysReflection(
          userId
        );

      if (cachedReflection) {
        return;
      }

      const context =
        await loadTodaysReflectionContext(
          userId
        );

      if (
        !context.dailyLogId ||
        !context.latestRevisionNumber
      ) {
        return;
      }

      const result =
        await generateTodaysReflection(
          context
        );

      await saveTodaysReflection({
        userId,
        dailyLogId:
          context.dailyLogId,
        logDate:
          context.logDate,
        latestRevisionNumber:
          context.latestRevisionNumber,
        result,
        context,
      });

      onTodaysReflectionComplete();
    };

  const createDerivedAnalyses =
    async () => {
      await ensureMeaningGrowth();

      await ensureTodaysReflection();
    };

  const handleAnalyze =
    async () => {
      if (
        loading ||
        todayLogs.length === 0
      ) {
        return;
      }

      setInsight(null);

      setShowAllReactionTargets(
        false
      );

      setLoading(true);
      setMessage("");

      try {
        const cached =
          await getTodayAnalysis(
            userId
          );

        if (cached) {
          setInsight(cached);

          onAnalysisComplete();

          try {
            await createDerivedAnalyses();
          } catch (
            derivedError
          ) {
            console.error(
              "파생 분석 생성 오류:",
              derivedError
            );

            setMessage(
              "기본 AI 분석은 불러왔지만, 일부 변화 분석을 만드는 중 오류가 발생했습니다."
            );
          }

          return;
        }

        const response =
          await fetch(
            "/api/analyze",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  logs:
                    todayLogs,
                }),
            }
          );

        if (!response.ok) {
          const responseText =
            await response.text();

          console.error(
            "AI 분석 API 오류:",
            response.status,
            responseText
          );

          throw new Error(
            "AI 분석에 실패했습니다."
          );
        }

        const data:
          AIInsight =
          await response.json();

        await saveAIAnalysis(
          userId,
          data
        );

        setInsight(data);

        onAnalysisComplete();

        try {
          await createDerivedAnalyses();
        } catch (
          derivedError
        ) {
          console.error(
            "파생 분석 생성 오류:",
            derivedError
          );

          setMessage(
            "AI 분석은 완료됐지만, 일부 변화 분석을 만드는 중 오류가 발생했습니다."
          );
        }
      } catch (error) {
        console.error(
          "AI 분석 오류:",
          error
        );

        setInsight(null);

        setMessage(
          error instanceof Error
            ? error.message
            : "AI 분석 중 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    let isMounted = true;

    setInsight(null);
    setMessage("");

    setShowAllReactionTargets(
      false
    );

    const loadCachedAnalysis =
      async () => {
        try {
          const cached =
            await getTodayAnalysis(
              userId
            );

          if (isMounted) {
            setInsight(
              cached
            );
          }
        } catch (error) {
          console.error(
            "저장된 AI 분석 조회 오류:",
            error
          );

          if (isMounted) {
            setInsight(null);

            setMessage(
              "저장된 AI 분석을 불러오지 못했습니다."
            );
          }
        }
      };

    void loadCachedAnalysis();

    return () => {
      isMounted = false;
    };
  }, [
    userId,
    refreshKey,
  ]);

  useEffect(() => {
    if (
      analysisRequestKey === 0 ||
      todayLogs.length === 0 ||
      lastHandledRequestKeyRef.current ===
        analysisRequestKey
    ) {
      return;
    }

    lastHandledRequestKeyRef.current =
      analysisRequestKey;

    void handleAnalyze();

    // analysisRequestKey가 변경될 때만
    // 저장 후 자동 분석을 실행한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    analysisRequestKey,
  ]);

  const validReactionTargets =
    insight?.reaction_targets.filter(
      (item) =>
        item &&
        item.target &&
        item.normalized_target &&
        typeof item.weight ===
          "number"
    ) ?? [];

  const displayedReactionTargets =
    showAllReactionTargets
      ? validReactionTargets
      : validReactionTargets.slice(
          0,
          3
        );

  const hiddenReactionTargetCount =
    Math.max(
      validReactionTargets.length -
        3,
      0
    );

  return (
    <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xl">
          🧭
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-indigo-600">
            오늘의 반응
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            기록에서 발견한 변화
          </h2>

          <p className="mt-3 break-keep text-sm leading-7 text-slate-600 sm:text-base">
            오늘 기록에서 마음이 움직인
            대상과 에너지, 몰입 신호를
            살펴봅니다.
          </p>
        </div>
      </div>

      {loading && (
        <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="animate-pulse text-lg"
            >
              🧠
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-indigo-700">
                AI가 오늘 기록을 읽고 있습니다
              </p>

              <p className="mt-1 break-keep text-sm leading-6 text-slate-600">
                기록에서 마음이 움직인
                대상과 변화의 흐름을
                살펴보는 중입니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {!loading &&
        !insight &&
        todayLogs.length ===
          0 && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="break-keep text-sm leading-6 text-slate-500">
              오늘 기록을 저장하면 AI
              분석이 자동으로 시작됩니다.
            </p>
          </div>
        )}

      {!loading &&
        !insight &&
        todayLogs.length >
          0 &&
        !message && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="break-keep text-sm leading-6 text-slate-500">
              기록을 저장하거나 수정하면
              AI가 변화를 자동으로
              살펴봅니다.
            </p>
          </div>
        )}

      {message && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="break-keep text-sm leading-6 text-red-700">
            {message}
          </p>
        </div>
      )}

      {insight && (
        <div className="mt-7 space-y-7">
          <div>
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="text-lg"
              >
                🔎
              </span>

              <h3 className="text-lg font-bold text-slate-950">
                마음이 움직인 대상
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              {displayedReactionTargets.map(
                (item) => {
                  const percentage =
                    Math.round(
                      item.weight *
                        100
                    );

                  return (
                    <article
                      key={`${item.target}-${item.type}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 break-keep text-base font-bold leading-7 text-slate-950">
                          {
                            item.normalized_target
                          }
                        </p>

                        <span className="shrink-0 rounded-full border border-indigo-100 bg-white px-3 py-1 text-xs font-semibold text-indigo-700">
                          {typeLabels[
                            item.type
                          ] ??
                            item.type}
                        </span>
                      </div>

                      <p className="mt-2 line-clamp-2 break-keep text-sm leading-6 text-slate-600">
                        {
                          item.evidence
                        }
                      </p>

                      <div className="mt-4 flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{
                              width:
                                `${percentage}%`,
                            }}
                          />
                        </div>

                        <span className="shrink-0 text-xs font-semibold text-indigo-600">
                          {
                            percentage
                          }
                          %
                        </span>
                      </div>

                      <details className="mt-3">
                        <summary className="cursor-pointer list-none text-[11px] font-medium text-slate-400">
                          기록 속 표현 보기
                          ▾
                        </summary>

                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          {
                            item.target
                          }
                        </p>
                      </details>
                    </article>
                  );
                }
              )}

              {hiddenReactionTargetCount >
                0 && (
                <button
                  type="button"
                  onClick={() =>
                    setShowAllReactionTargets(
                      (
                        previous
                      ) =>
                        !previous
                    )
                  }
                  aria-expanded={
                    showAllReactionTargets
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2"
                >
                  {showAllReactionTargets
                    ? "핵심 반응만 보기"
                    : `나머지 ${hiddenReactionTargetCount}개 반응 보기`}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                💜
              </div>

              <p className="mt-4 text-sm text-slate-500">
                전체 감정
              </p>

              <p className="mt-1 break-keep text-base font-bold text-slate-950">
                {
                  insight.overall_emotion
                }
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                ⚡
              </div>

              <p className="mt-4 text-sm text-slate-500">
                에너지
              </p>

              <p className="mt-1 text-base font-bold text-slate-950">
                {
                  insight.overall_energy
                }
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                💧
              </div>

              <p className="mt-4 text-sm text-slate-500">
                몰입 신호
              </p>

              <p className="mt-1 text-base font-bold text-indigo-600">
                {Math.round(
                  insight.immersion_score *
                    100
                )}
                %
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                🛡️
              </div>

              <p className="mt-4 text-sm text-slate-500">
                분석 신뢰도
              </p>

              <p className="mt-1 text-base font-bold text-indigo-600">
                {Math.round(
                  insight.confidence *
                    100
                )}
                %
              </p>
            </div>
          </div>

          <article className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                🧠
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-blue-700">
                  AI가 읽은 오늘의 흐름
                </p>

                <p className="mt-3 break-keep text-base leading-8 text-slate-700">
                  {
                    insight.summary
                  }
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-blue-200 pt-5">
              <div className="flex items-start gap-3 px-1">
                <span
                  aria-hidden="true"
                  className="shrink-0 text-lg"
                >
                  👇
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-indigo-700">
                    다음 단계
                  </p>

                  <p className="mt-3 break-keep text-lg font-bold leading-8 text-slate-900">
                    아래 Reflection
                    Loop에서
                    <br />
                    AI와 함께 오늘의
                    생각을
                    <br />
                    조금 더 이어가
                    보세요.
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}