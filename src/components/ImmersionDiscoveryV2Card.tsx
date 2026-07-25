"use client";

import { useEffect, useState } from "react";

import { loadImmersionDiscoveryV2 } from "@/services/immersionDiscoveryV2Service";
import type { ImmersionDiscoveryV2 } from "@/types/immersionDiscoveryV2";

type Props = {
  userId: string;
  refreshKey: number;
};

const statusLabel = {
  discovered: "반복 속에서 발견된 신호",
  candidate: "조금씩 나타나는 몰입 후보",
  not_found: "몰입 신호를 발견하는 중",
};

const growthLabel = {
  up: "커지고 있음",
  down: "작아지고 있음",
  stable: "비슷하게 이어짐",
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

export default function ImmersionDiscoveryV2Card({
  userId,
  refreshKey,
}: Props) {
  const [discovery, setDiscovery] =
    useState<ImmersionDiscoveryV2 | null>(null);

  const [loading, setLoading] = useState(true);
  const [showEvidence, setShowEvidence] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        const result = await loadImmersionDiscoveryV2(userId);

        setDiscovery(result);
        setShowEvidence(false);
        setShowAll(false);
      } catch (error) {
        console.error("몰입 발견 V2 조회 실패:", error);
        setDiscovery(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId, refreshKey]);

  if (loading) {
    return (
      <section className="mt-10 rounded-2xl border border-purple-100 bg-purple-50 p-5">
        <p className="text-sm text-gray-500">
          최근 기록에서 반복되는 몰입 신호를 찾고 있습니다.
        </p>
      </section>
    );
  }

  if (!discovery) {
    return (
      <section className="mt-10 rounded-2xl border border-purple-100 bg-purple-50 p-5">
        <h2 className="text-xl font-bold">몰입 발견</h2>

        <p className="mt-3 leading-7 text-gray-600">
          몰입 발견 정보를 불러오지 못했습니다.
        </p>
      </section>
    );
  }

  const visibleSignals = showAll
    ? discovery.repeatedSignals
    : discovery.repeatedSignals.slice(0, 5);

  if (discovery.status === "not_found") {
    return (
      <section className="mt-10 rounded-2xl border border-purple-100 bg-purple-50 p-5">
        <p className="text-sm font-semibold text-purple-700">
          {statusLabel.not_found}
        </p>

        <h2 className="mt-2 text-xl font-bold">
          아직 하나의 몰입 신호는 발견되지 않았습니다
        </h2>

        <p className="mt-3 leading-7 text-gray-600">
          몰입이 없다는 뜻은 아닙니다.
          <br />
          기록 속 반응이 반복해서 이어지는지 살펴보고 있습니다.
        </p>

        {discovery.repeatedSignals.length > 0 ? (
          <div className="mt-6">
            <h3 className="text-lg font-bold">
              현재 반복해서 나타나는 반응
            </h3>

            <div className="mt-3 space-y-3">
              {visibleSignals.map((item) => (
                <div
                  key={item.target}
                  className="rounded-xl border border-purple-100 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">{item.target}</p>

                    <span className="shrink-0 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                      {typeLabel[item.dominantType] ??
                        item.dominantType}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    {item.frequency}회 등장 · 평균 반응{" "}
                    {Math.round(item.averageWeight * 100)}% ·{" "}
                    {growthLabel[item.growthDirection]}
                  </p>

                  <p className="mt-2 text-xs text-gray-500">
                    {item.firstSeenAt} ~ {item.latestSeenAt}
                  </p>
                </div>
              ))}
            </div>

            {discovery.repeatedSignals.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAll((previous) => !previous)}
                aria-expanded={showAll}
                className="mt-4 w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-50"
              >
                {showAll
                  ? "접기"
                  : `전체 보기 (${discovery.repeatedSignals.length})`}
              </button>
            )}
          </div>
        ) : (
          <p className="mt-6 rounded-xl border border-purple-100 bg-white p-4 leading-7 text-gray-600">
            기록이 조금 더 쌓이면 반복해서 나타나는 반응부터
            보여드립니다.
          </p>
        )}
      </section>
    );
  }

  const primarySignal = discovery.primarySignal;

  if (!primarySignal) {
    return null;
  }

  return (
    <section className="mt-10 rounded-2xl border border-purple-100 bg-purple-50 p-5">
      <p className="text-sm font-semibold text-purple-700">
        {statusLabel[discovery.status]}
      </p>

      <h2 className="mt-2 text-xl font-bold">
        현재 가장 강한 몰입 신호
      </h2>

      <div className="mt-5 rounded-2xl border border-purple-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-2xl font-bold text-gray-900">
              {primarySignal.target}
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              최근 {discovery.periodDays}일 동안의 기록에서
              발견되었습니다.
            </p>

            {discovery.summary && (
              <p className="mt-4 leading-7 text-gray-700">
                {discovery.summary}
              </p>
            )}
          </div>

          <span className="shrink-0 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
            {typeLabel[primarySignal.dominantType] ??
              primarySignal.dominantType}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-bold">
          이렇게 판단한 근거
        </h3>

        <ul className="mt-3 space-y-3">
          {discovery.why.map((reason) => (
            <li
              key={reason}
              className="flex gap-3 rounded-xl border border-purple-100 bg-white px-4 py-3 leading-7 text-gray-700"
            >
              <span
                aria-hidden="true"
                className="font-bold text-purple-600"
              >
                ✓
              </span>

              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={() => {
          setShowEvidence((previous) => !previous);

          if (showEvidence) {
            setShowAll(false);
          }
        }}
        aria-expanded={showEvidence}
        className="mt-6 flex w-full items-center justify-between rounded-xl border border-purple-200 bg-white px-4 py-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-50"
      >
        <span>근거가 된 반복 반응 보기</span>

        <span
          aria-hidden="true"
          className={`transition-transform ${
            showEvidence ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {showEvidence && (
        <div className="mt-4">
          <div className="space-y-3">
            {visibleSignals.map((item) => (
              <div
                key={item.target}
                className="rounded-xl border border-purple-100 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold">{item.target}</p>

                  <span className="shrink-0 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                    {typeLabel[item.dominantType] ??
                      item.dominantType}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">등장</p>
                    <p className="font-semibold">
                      {item.frequency}회
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      평균 반응
                    </p>
                    <p className="font-semibold">
                      {Math.round(item.averageWeight * 100)}%
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      최근 반응
                    </p>
                    <p className="font-semibold">
                      {Math.round(item.latestWeight * 100)}%
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">변화</p>
                    <p className="font-semibold">
                      {growthLabel[item.growthDirection]}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-xs text-gray-500">
                  {item.firstSeenAt} ~ {item.latestSeenAt}
                </p>
              </div>
            ))}
          </div>

          {discovery.repeatedSignals.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAll((previous) => !previous)}
              aria-expanded={showAll}
              className="mt-4 w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-50"
            >
              {showAll
                ? "접기"
                : `전체 보기 (${discovery.repeatedSignals.length})`}
            </button>
          )}
        </div>
      )}
    </section>
  );
}