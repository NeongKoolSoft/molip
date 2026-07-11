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

import { saveMeaningGrowthAnalysis } from "@/services/meaningGrowthAnalysisService";

type LegacyAIInsight = AIInsight & {
  question?: string;
};

type AIInsightCardProps = {
  userId: string;
  logs: DailyLog[];
  refreshKey: number;
  onAnalysisComplete: () => void;
  onMeaningGrowthComplete: () => void;  
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
}: AIInsightCardProps) {
  const [insight, setInsight] = useState<LegacyAIInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const todayLogs = logs.filter((log) => log.log_date === today);

  const createAndSaveMeaningGrowth = async () => {
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

  const handleAnalyze = async () => {
    setInsight(null);
    setLoading(true);
    setMessage("");

    try {
      const cached = await getTodayAnalysis(userId);

      if (cached) {
        setInsight(cached);
        onAnalysisComplete();
        return;
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ logs: todayLogs }),
      });

      if (!response.ok) {
        throw new Error("AI 분석 실패");
      }

      const data: AIInsight = await response.json();

      setInsight(data);
      await saveAIAnalysis(userId, data);
      await createAndSaveMeaningGrowth();
      onAnalysisComplete();
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
      <h2 className="mb-3 text-xl font-bold">AI가 발견한 나의 변화</h2>

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

      {message && <p className="mt-4 text-sm text-red-500">{message}</p>}

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
                    <p className="font-semibold">{item.normalized_target}</p>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                      {typeLabels[item.type] ?? item.type}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-gray-500">
                    원문 표현: {item.target}
                  </p>

                  <p className="mt-2 text-gray-700">{item.evidence}</p>

                  <p className="mt-2 text-xs text-gray-500">
                    반응 강도 {Math.round(item.weight * 100)}%
                  </p>
                </div>
              ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-200 p-3">
              <p className="text-gray-500">전체 감정</p>
              <p className="mt-1 font-semibold">{insight.overall_emotion}</p>
            </div>

            <div className="rounded-xl border border-gray-200 p-3">
              <p className="text-gray-500">에너지</p>
              <p className="mt-1 font-semibold">{insight.overall_energy}</p>
            </div>

            <div className="rounded-xl border border-gray-200 p-3">
              <p className="text-gray-500">몰입 신호</p>
              <p className="mt-1 font-semibold">
                {Math.round(insight.immersion_score * 100)}%
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-3">
              <p className="text-gray-500">분석 신뢰도</p>
              <p className="mt-1 font-semibold">
                {Math.round(insight.confidence * 100)}%
              </p>
            </div>
          </div>

          <p className="mt-5 font-semibold">요약</p>
          <p className="mt-1">{insight.summary}</p>

          <div className="mt-6 rounded-xl border-l-4 border-blue-500 bg-blue-50 p-4">
            <p className="font-semibold">🤔 잠시 돌아보기</p>
            <p className="mt-2 leading-7">{reflectionQuestion}</p>
          </div>
        </div>
      )}
    </div>
  );
}