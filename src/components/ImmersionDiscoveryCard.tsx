"use client";

import { useEffect, useState } from "react";

import type { ImmersionTargetEvidence } from "@/types/immersionDiscovery";
import { loadImmersionTargetEvidence } from "@/services/immersionDiscoveryService";

type Props = {
  userId: string;
  refreshKey: number;
};

const trendLabel = {
  up: "상승",
  down: "하락",
  stable: "유지",
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

export default function ImmersionDiscoveryCard({
  userId,
  refreshKey,
}: Props) {
  const [targets, setTargets] = useState<ImmersionTargetEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        const result = await loadImmersionTargetEvidence(userId);
        setTargets(result);
        setShowAll(false);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId, refreshKey]);

  if (loading) {
    return (
      <div className="mt-10 rounded-2xl border border-purple-100 bg-purple-50 p-5">
        <p className="text-sm text-gray-500">
          최근 반복되는 반응을 분석하고 있습니다.
        </p>
      </div>
    );
  }

  if (targets.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-purple-100 bg-purple-50 p-5">
        <h2 className="text-xl font-bold">반복되는 반응</h2>

        <p className="mt-3 leading-7 text-gray-600">
          아직 충분한 기록이 없습니다.
          <br />
          며칠간 기록이 쌓이면 반복되는 반응이 나타납니다.
        </p>
      </div>
    );
  }

  const visibleTargets = showAll ? targets : targets.slice(0, 5);

  return (
    <section className="mt-10 rounded-2xl border border-purple-100 bg-purple-50 p-5">
      <h2 className="text-xl font-bold">반복되는 반응</h2>

      <p className="mt-2 text-gray-600">
        최근 기록에서 자주 등장한 대상입니다.
      </p>

      <div className="mt-5 space-y-4">
        {visibleTargets.map((item) => (
          <div
            key={item.target}
            className="rounded-xl border border-purple-100 bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold">{item.target}</p>

              <span className="rounded-full bg-purple-50 px-3 py-1 text-xs text-purple-700">
                {typeLabel[item.dominantType] ?? item.dominantType}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">등장</p>
                <p className="font-semibold">{item.frequency}회</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">평균 반응</p>
                <p className="font-semibold">
                  {Math.round(item.averageWeight * 100)}%
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">최근 반응</p>
                <p className="font-semibold">
                  {Math.round(item.latestWeight * 100)}%
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">변화</p>
                <p className="font-semibold">{trendLabel[item.trend]}</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              {item.firstSeenAt} ~ {item.latestSeenAt}
            </p>
          </div>
        ))}
      </div>

      {targets.length > 5 && (
        <button
          type="button"
          onClick={() => setShowAll((previous) => !previous)}
          aria-expanded={showAll}
          className="mt-4 flex w-full items-center justify-between rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-50"
        >
          <span>
            {showAll
              ? "접기"
              : `전체 보기 (${targets.length})`}
          </span>

          <span
            aria-hidden="true"
            className={`transition-transform ${
              showAll ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </button>
      )}
    </section>
  );
}