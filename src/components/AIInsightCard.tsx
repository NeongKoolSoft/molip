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
  const [insight, setInsight] = useState<LegacyAIInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const todayLogs = logs.filter((log) => log.log_date === today);

  /**
   * 최초 Revision과 최신 Revision이 모두 있을 때
   * Meaning Growth를 생성하고 저장한다.
   *
   * 이미 저장된 결과가 있다면 다시 생성하지 않는다.
   */
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
      initialRevisionNumber: context.initialRevisionNumber,
      latestRevisionNumber: context.latestRevisionNumber,
      result: meaningGrowth,
    });

    onMeaningGrowthComplete();
  };

  /**
   * 저장된 분석 결과를 모아 Today's Reflection을 생성한다.
   *
   * 이미 저장된 Today's Reflection이 있다면
   * Gemini를 다시 호출하지 않는다.
   */
  const ensureTodaysReflection = async () => {
    const cachedReflection =
      await getTodayTodaysReflection(userId);

    if (cachedReflection) {
      return;
    }

    const context = await loadTodaysReflectionContext(userId);

    if (
      !context.dailyLogId ||
      !context.latestRevisionNumber
    ) {
      return;
    }

    const result = await generateTodaysReflection(context);

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

  /**
   * 기본 Reaction 분석 이후 실행되는 파생 분석 흐름이다.
   *
   * Meaning Growth가 DB에 저장된 뒤
   * Today's Reflection Context를 구성해야
   * 최신 Meaning Growth가 반영된다.
   */
  const createDerivedAnalyses = async () => {
    await ensureMeaningGrowth();
    await ensureTodaysReflection();
  };

  const handleAnalyze = async () => {
    setInsight(null);
    setLoading(true);
    setMessage("");

    try {
      const cached = await getTodayAnalysis(userId);

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
        const responseText = await response.text();

        console.error(
          "AI 분석 API 오류:",
          response.status,
          responseText
        );

        throw new Error("AI 분석 실패");
      }

      const data: AIInsight = await response.json();

      setInsight(data);

      await saveAIAnalysis(userId, data);

      // Reaction 관련 카드부터 갱신한다.
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
      setMessage("AI 분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setInsight(null);

    const loadCachedAnalysis = async () => {
      try {
        const cached = await getTodayAnalysis(userId);

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
    <div className="mt-10 rounded-2xl border border-blue-100 bg-blue-50 p-5">
      <h2 className="mb-3 text-xl font-bold">
        AI가 발견한 나의 변화
      </h2>

      <p className="leading-7 text-gray-700">
        최근 기록을 기반으로
        <br />
        반복되는 반응 대상과 몰입 신호를 분석합니다.
      </p>

      <button
        onClick={handleAnalyze}
        disabled={loading || todayLogs.length === 0}
        className="mt-5 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white disabled:bg-gray-300"
      >
        {loading ? "분석 중..." : "AI 분석하기"}
      </button>

      {message && (
        <p className="mt-4 text-sm text-red-500">
          {message}
        </p>
      )}

      {insight && (
        <div className="mt-5 rounded-xl bg-white p-4 text-sm leading-6 text-gray-700">
          <p className="font-semibold">반응 대상</p>

          <div className="mt-3 space-y-3">
            {insight.reaction_targets
              .filter(
                (item) =>
                  item &&
                  item.target &&
                  item.normalized_target &&
                  typeof item.weight === "number"
              )
              .map((item) => (
                <div
                  key={`${item.target}-${item.type}`}
                  className="rounded-xl border border-gray-200 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">
                      {item.normalized_target}
                    </p>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                      {typeLabels[item.type] ?? item.type}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-gray-500">
                    원문 표현: {item.target}
                  </p>

                  <p className="mt-2 text-gray-700">
                    {item.evidence}
                  </p>

                  <p className="mt-2 text-xs text-gray-500">
                    반응 강도{" "}
                    {Math.round(item.weight * 100)}%
                  </p>
                </div>
              ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-200 p-3">
              <p className="text-gray-500">전체 감정</p>
              <p className="mt-1 font-semibold">
                {insight.overall_emotion}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-3">
              <p className="text-gray-500">에너지</p>
              <p className="mt-1 font-semibold">
                {insight.overall_energy}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-3">
              <p className="text-gray-500">몰입 신호</p>
              <p className="mt-1 font-semibold">
                {Math.round(
                  insight.immersion_score * 100
                )}
                %
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-3">
              <p className="text-gray-500">
                분석 신뢰도
              </p>
              <p className="mt-1 font-semibold">
                {Math.round(insight.confidence * 100)}%
              </p>
            </div>
          </div>

          <p className="mt-5 font-semibold">요약</p>
          <p className="mt-1">{insight.summary}</p>

          <div className="mt-6 rounded-xl border-l-4 border-blue-500 bg-blue-50 p-4">
            <p className="font-semibold">
              🤔 잠시 돌아보기
            </p>

            <p className="mt-2 leading-7">
              {reflectionQuestion}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}