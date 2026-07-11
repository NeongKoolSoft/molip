"use client";

import { useEffect, useState } from "react";

import type { GrowthSignal } from "@/types/growthSignal";
import { loadTodayGrowthSignal } from "@/services/growthSignalService";

type GrowthSignalCardProps = {
  userId: string;
  refreshKey: number;
};

export default function GrowthSignalCard({
  userId,
  refreshKey,
}: GrowthSignalCardProps) {
  const [signal, setSignal] = useState<GrowthSignal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        const result = await loadTodayGrowthSignal(userId);
        setSignal(result);
      } catch (error) {
        console.error("Growth Signal 조회 실패:", error);
        setSignal(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId, refreshKey]);

  if (loading) {
    return (
      <div className="mt-10 rounded-2xl border border-green-100 bg-green-50 p-5">
        <p className="text-sm text-gray-500">
          오늘의 생각 변화를 불러오고 있습니다.
        </p>
      </div>
    );
  }

  if (!signal) {
    return null;
  }

  const lengthChangeLabel =
    signal.lengthChange > 0
      ? `+${signal.lengthChange}자`
      : `${signal.lengthChange}자`;

  const sentenceChangeLabel =
    signal.sentenceChange > 0
      ? `+${signal.sentenceChange}문장`
      : `${signal.sentenceChange}문장`;

  return (
    <section className="mt-10 rounded-2xl border border-green-100 bg-green-50 p-5">
      <h2 className="text-xl font-bold">🌱 생각의 변화</h2>

      {signal.revisionCount <= 1 ? (
        <div className="mt-4 rounded-xl bg-white p-4">
          <p className="leading-7 text-gray-700">
            아직 오늘의 기록은 첫 번째 버전입니다.
          </p>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            돌아볼 질문을 통해 기록을 다시 작성하면 생각의 변화가 여기에
            나타납니다.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4 rounded-xl bg-white p-4">
            <p className="leading-7 text-gray-700">
              오늘의 기록은{" "}
              <strong>{signal.editCount}번의 수정</strong>을 거치며
              다시 표현되었습니다.
            </p>

            <p className="mt-3 leading-7 text-gray-700">
              {signal.summary}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-green-100 bg-white p-3 text-center">
              <p className="text-xs text-gray-500">수정</p>
              <p className="mt-1 font-semibold">{signal.editCount}회</p>
            </div>

            <div className="rounded-xl border border-green-100 bg-white p-3 text-center">
              <p className="text-xs text-gray-500">기록 변화</p>
              <p className="mt-1 font-semibold">{lengthChangeLabel}</p>
            </div>

            <div className="rounded-xl border border-green-100 bg-white p-3 text-center">
              <p className="text-xs text-gray-500">문장 변화</p>
              <p className="mt-1 font-semibold">{sentenceChangeLabel}</p>
            </div>
          </div>

          <p className="mt-4 text-xs leading-5 text-gray-500">
            처음 {signal.initialLength}자에서 현재 {signal.latestLength}자로
            변화했습니다. 이 수치는 성장을 평가하는 점수가 아니라, 오늘
            기록을 다시 돌아본 흔적입니다.
          </p>
        </>
      )}
    </section>
  );
}