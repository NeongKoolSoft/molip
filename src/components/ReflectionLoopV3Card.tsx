"use client";

import { useEffect, useState } from "react";

import { getTodayAnalysis } from "@/services/aiAnalysisService";
import { loadRecentLogs } from "@/services/dailyLogService";

import {
  createReflectionLoopContext,
} from "@/services/reflectionLoopService";

import {
  analyzeReflectionContext,
} from "@/services/reflectionContextAnalysisService";

import {
  createQuestionContext,
} from "@/services/questionContextService";

import {
  generateReflectionQuestion,
} from "@/services/reflectionQuestionService";

import type {
  ReflectionQuestionResult,
} from "@/types/reflectionLoop";

import type {
  ReflectionContextAnalysis,
} from "@/types/reflectionContextAnalysis";

import type {
  DailyLog,
} from "@/types/dailyLog";

type Props = {
  userId: string;
  refreshKey: number;

  onContinueReflection: (
    question: string
  ) => void;
};

const selectLatestLog = (
  logs: DailyLog[]
): DailyLog | null => {
  if (logs.length === 0) {
    return null;
  }

  return [...logs].sort((a, b) =>
    b.log_date.localeCompare(a.log_date)
  )[0];
};

const createEvidenceList = (
  analysis: ReflectionContextAnalysis | null
): string[] => {
  if (!analysis) {
    return [];
  }

  return Array.from(
    new Set([
      ...(analysis.mainThread?.evidence ?? []),
      ...(analysis.focus?.evidence ?? []),
      ...analysis.thoughtPattern.evidence,
    ])
  );
};

export default function ReflectionLoopV3Card({
  userId,
  refreshKey,
  onContinueReflection,
}: Props) {
  const [
    reflectionAnalysis,
    setReflectionAnalysis,
  ] =
    useState<ReflectionContextAnalysis | null>(
      null
    );

  const [result, setResult] =
    useState<ReflectionQuestionResult | null>(
      null
    );

  const [loading, setLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [hasAnalysis, setHasAnalysis] =
    useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkTodayAnalysis = async () => {
      try {
        const insight =
          await getTodayAnalysis(userId);

        if (!isMounted) {
          return;
        }

        setHasAnalysis(Boolean(insight));

        setReflectionAnalysis(null);
        setResult(null);
        setErrorMessage("");
      } catch (error) {
        console.error(
          "오늘 AI 분석 확인 오류:",
          error
        );

        if (isMounted) {
          setHasAnalysis(false);
        }
      }
    };

    checkTodayAnalysis();

    return () => {
      isMounted = false;
    };
  }, [userId, refreshKey]);

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const [logs, aiInsight] =
        await Promise.all([
          loadRecentLogs(userId),
          getTodayAnalysis(userId),
        ]);

      if (!aiInsight) {
        throw new Error(
          "먼저 오늘 기록의 변화를 분석해 주세요."
        );
      }

      const latestLog =
        selectLatestLog(logs);

      if (!latestLog) {
        throw new Error(
          "생각의 흐름을 살펴볼 기록이 없습니다."
        );
      }

      const latestRecord =
        latestLog.content.trim();

      if (!latestRecord) {
        throw new Error(
          "오늘 기록 내용이 비어 있습니다."
        );
      }

      const loopContext =
        createReflectionLoopContext({
          logs,
          aiInsight,
        });

      const analysis =
        await analyzeReflectionContext({
          latestRecord,
          aiInsight,
        });

      const questionContext =
        createQuestionContext({
          logs,
          loopContext,
          aiInsight,
          reflectionAnalysis: analysis,
        });

      const generatedQuestion =
        await generateReflectionQuestion(
          questionContext
        );

      setReflectionAnalysis(analysis);
      setResult(generatedQuestion);
    } catch (error) {
      console.error(
        "Reflection Loop V3 생성 오류:",
        error
      );

      setReflectionAnalysis(null);
      setResult(null);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "생각의 흐름을 살펴보지 못했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!result?.question) {
      return;
    }

    onContinueReflection(
      result.question
    );
  };

  const evidence =
    createEvidenceList(
      reflectionAnalysis
    );

  const mainThread =
    reflectionAnalysis?.mainThread;

  const focus =
    reflectionAnalysis?.focus;

  if (!hasAnalysis) {
    return (
      <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xl">
            💬
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-indigo-600">
              Reflection Loop
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
              생각을 한 번 더 이어가 보세요
            </h2>

            <p className="mt-3 break-keep text-sm leading-7 text-slate-600">
              오늘 기록의 변화를 먼저 분석하면,
              AI가 중심 흐름을 읽고 다음 질문을
              만들어 드립니다.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm leading-6 text-slate-500">
            위의 ‘기록에서 변화 발견하기’를 먼저
            실행해 주세요.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xl">
          💬
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-indigo-600">
            Reflection Loop
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            AI와 함께 생각을 이어가 보세요
          </h2>

          <p className="mt-3 break-keep text-sm leading-7 text-slate-600 sm:text-base">
            AI가 오늘 기록의 중심 흐름과 아직
            충분히 표현되지 않은 부분을 살펴봅니다.
          </p>
        </div>
      </div>

      {!reflectionAnalysis && !result && (
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-4 text-base font-bold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading
            ? "오늘의 생각을 읽고 있습니다..."
            : "생각의 흐름 살펴보기"}
        </button>
      )}

      {errorMessage && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm leading-6 text-red-700">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="mt-4 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            다시 시도하기
          </button>
        </div>
      )}

      {reflectionAnalysis && result && (
        <div className="mt-7 space-y-4">
          <article className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                🧠
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-blue-700">
                  AI가 발견한 중심 흐름
                </p>

                <h3 className="mt-3 break-keep text-lg font-bold leading-8 text-slate-950">
                  {mainThread?.target ??
                    "중심 흐름을 특정하지 못했습니다."}
                </h3>

                {mainThread?.reason && (
                  <p className="mt-3 break-keep text-sm leading-7 text-slate-600">
                    {mainThread.reason}
                  </p>
                )}
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                ✨
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-amber-800">
                  조금 더 생각해 볼 지점
                </p>

                <h3 className="mt-3 break-keep text-lg font-bold leading-8 text-slate-950">
                  {focus?.text ??
                    "추가로 살펴볼 지점을 특정하지 못했습니다."}
                </h3>

                {focus?.reason && (
                  <p className="mt-3 break-keep text-sm leading-7 text-slate-600">
                    {focus.reason}
                  </p>
                )}
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                💬
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-indigo-700">
                  이어서 생각해 보기
                </p>

                <p className="mt-3 break-keep text-lg font-bold leading-8 text-slate-950">
                  {result.question}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-4 text-base font-bold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
            >
              <span aria-hidden="true">
                ✏️
              </span>

              <span>
                질문에 답하며 이어쓰기
              </span>
            </button>

            <p className="mt-3 text-center text-xs leading-5 text-slate-500">
              떠오른 생각을 오늘 기록 마지막에
              덧붙여 주세요.
            </p>
          </article>

          {evidence.length > 0 && (
            <details className="group rounded-2xl border border-slate-200 bg-slate-50">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-slate-700">
                <span>
                  AI가 참고한 기록 보기
                </span>

                <span
                  aria-hidden="true"
                  className="text-slate-400 transition group-open:rotate-180"
                >
                  ⌄
                </span>
              </summary>

              <div className="border-t border-slate-200 px-5 py-4">
                <ul className="space-y-3">
                  {evidence.map(
                    (item, index) => (
                      <li
                        key={`${item}-${index}`}
                        className="flex gap-3 text-sm leading-7 text-slate-600"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-0.5 text-indigo-400"
                        >
                          ·
                        </span>

                        <span className="break-keep">
                          {item}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </details>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "다시 읽고 있습니다..."
              : "질문 다시 만들기"}
          </button>
        </div>
      )}
    </section>
  );
}