"use client";

import { useEffect, useState } from "react";

import type {
  MeaningGrowth,
  MeaningStage,
} from "@/types/meaningGrowth";

import { getTodayMeaningGrowthAnalysis } from "@/services/meaningGrowthAnalysisService";

type MeaningGrowthCardProps = {
  userId: string;
  refreshKey: number;
};

const stageLabels: Record<MeaningStage, string> = {
  action: "행동",
  reason: "이유",
  value: "가치",
  life_direction: "삶의 방향",
  unknown: "판단 어려움",
};

export default function MeaningGrowthCard({
  userId,
  refreshKey,
}: MeaningGrowthCardProps) {
  const [growth, setGrowth] = useState<MeaningGrowth | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMessage("");
      setGrowth(null);

      try {
        const result = await getTodayMeaningGrowthAnalysis(userId);
        setGrowth(result);
      } catch (error) {
        console.error("Meaning Growth 조회 실패:", error);
        setMessage("의미 변화를 분석하는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId, refreshKey]);

  if (loading) {
    return (
      <section className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-5">
        <p className="text-sm text-gray-500">
          기록 사이의 의미 변화를 살펴보고 있습니다.
        </p>
      </section>
    );
  }

  if (message) {
    return (
      <section className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-5">
        <p className="text-sm text-red-500">{message}</p>
      </section>
    );
  }

  if (!growth) {
    return null;
  }

  return (
    <section className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-5">
      <h2 className="text-xl font-bold">의미의 확장</h2>

      {!growth.hasMeaningGrowth ? (
        <div className="mt-4 rounded-xl bg-white p-4">
          <p className="leading-7 text-gray-700">
            기록의 표현은 달라졌지만, 새롭게 추가된 의미는 아직 뚜렷하지
            않습니다.
          </p>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            표현을 다듬는 과정 역시 오늘의 생각을 정리한 흔적입니다.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4 rounded-xl bg-white p-4">
            <div className="flex items-center gap-3 text-sm">
              <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">
                {stageLabels[growth.fromStage]}
              </span>

              <span className="text-gray-400">→</span>

              <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-800">
                {stageLabels[growth.toStage]}
              </span>
            </div>

            <p className="mt-4 leading-7 text-gray-700">
              {growth.summary}
            </p>
          </div>

          {growth.addedMeanings.length > 0 && (
            <div className="mt-4 rounded-xl bg-white p-4">
              <p className="font-semibold">새롭게 드러난 의미</p>

              <ul className="mt-3 space-y-2">
                {growth.addedMeanings.map((meaning, index) => (
                  <li
                    key={`${meaning}-${index}`}
                    className="flex gap-2 leading-6 text-gray-700"
                  >
                    <span className="text-amber-500">•</span>
                    <span>{meaning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {growth.evidence.length > 0 && (
            <div className="mt-4 rounded-xl border border-amber-100 bg-white p-4">
              <p className="font-semibold">기록에서 보인 근거</p>

              <div className="mt-3 space-y-3">
                {growth.evidence.map((evidence, index) => (
                  <blockquote
                    key={`${evidence}-${index}`}
                    className="border-l-2 border-amber-300 pl-3 leading-6 text-gray-600"
                  >
                    {evidence}
                  </blockquote>
                ))}
              </div>
            </div>
          )}

          <p className="mt-4 text-xs leading-5 text-gray-500">
            이 내용은 사용자를 평가하거나 정의하는 결과가 아니라, 최초
            기록과 최신 기록 사이에서 새롭게 드러난 의미를 정리한 것입니다.
          </p>
        </>
      )}
    </section>
  );
}