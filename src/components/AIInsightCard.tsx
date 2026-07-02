"use client";

import { useState } from "react";
import type { DailyLog } from "@/types/dailyLog";
import type { AIInsight } from "@/services/aiInsightService";

type AIInsightCardProps = {
  logs: DailyLog[];
};

export default function AIInsightCard({ logs }: AIInsightCardProps) {
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAnalyze = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ logs }),
      });

      if (!response.ok) {
        throw new Error("AI 분석 실패");
      }

      const data = await response.json();
      setInsight(data);
    } catch (error) {
      console.error(error);
      setMessage("AI 분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 rounded-2xl border border-blue-100 bg-blue-50 p-5">
      <h2 className="text-xl font-bold mb-3">AI가 발견한 나의 변화</h2>

      <p className="text-gray-700 leading-7">
        최근 기록을 기반으로
        <br />
        반복되는 반응 대상을 분석합니다.
      </p>

      <button
        onClick={handleAnalyze}
        disabled={loading || logs.length === 0}
        className="mt-5 w-full rounded-xl bg-blue-600 py-3 text-white font-semibold disabled:bg-gray-300"
      >
        {loading ? "분석 중..." : "AI 분석하기"}
      </button>

      {message && (
        <p className="mt-4 text-sm text-red-500">{message}</p>
      )}

      {insight && (
        <div className="mt-5 rounded-xl bg-white p-4 text-sm text-gray-700 leading-6">
          <p className="font-semibold">반응 대상</p>

          <ul className="mt-2 list-disc pl-5">
            {insight.reaction_targets.map((target) => (
              <li key={target}>{target}</li>
            ))}
          </ul>

          <p className="mt-4 font-semibold">요약</p>
          <p className="mt-1">{insight.summary}</p>

          <p className="mt-4 font-semibold">다음 질문</p>
          <p className="mt-1">{insight.question}</p>
        </div>
      )}
    </div>
  );
}