"use client";

import { useEffect, useState } from "react";

import {
  loadReactionTimeline,
  type ReactionTimelineGroup,
} from "@/services/reactionTimelineService";

type ReactionTimelineCardProps = {
  userId: string;
  refreshKey: number;
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

const VISIBLE_ITEM_COUNT = 5;

export default function ReactionTimelineCard({
  userId,
  refreshKey,
}: ReactionTimelineCardProps) {
  const [groups, setGroups] = useState<ReactionTimelineGroup[]>([]);
  const [expandedTargets, setExpandedTargets] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const load = async () => {
      try {
        const result = await loadReactionTimeline(userId);

        setGroups(result);
        setExpandedTargets({});
      } catch (error) {
        console.error(error);
      }
    };

    load();
  }, [userId, refreshKey]);

  if (groups.length === 0) {
    return null;
  }

  const toggleExpanded = (target: string) => {
    setExpandedTargets((previous) => ({
      ...previous,
      [target]: !previous[target],
    }));
  };

  return (
    <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-xl font-bold">Reaction Timeline</h2>

      <div className="space-y-8">
        {groups.map((group) => {
          const isExpanded = expandedTargets[group.target] ?? false;

          /*
           * 현재 서비스가 날짜 오름차순으로 반환하는 구조이므로
           * 기본 화면에서는 배열의 마지막 5개를 사용한다.
           */
          const visibleItems = isExpanded
            ? group.items
            : group.items.slice(-VISIBLE_ITEM_COUNT);

          const hiddenItemCount = Math.max(
            0,
            group.items.length - VISIBLE_ITEM_COUNT
          );

          return (
            <div key={group.target}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold">{group.target}</h3>

                <span className="shrink-0 text-xs text-gray-500">
                  {group.items.length}회 등장
                </span>
              </div>

              <div className="space-y-4">
                {visibleItems.map((item, index) => (
                  <div
                    key={`${item.date}-${item.type}-${index}`}
                    className="flex gap-3"
                  >
                    <div className="flex flex-col items-center">
                      <div className="mt-1 h-3 w-3 rounded-full bg-blue-600" />

                      {index < visibleItems.length - 1 && (
                        <div className="mt-1 h-full min-h-16 w-px bg-gray-200" />
                      )}
                    </div>

                    <div className="flex-1 rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-gray-500">
                          {item.date}
                        </p>

                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                          {typeLabels[item.type] ?? item.type}
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-gray-700">
                        {item.evidence}
                      </p>

                      <p className="mt-2 text-xs text-gray-500">
                        반응 강도 {Math.round(item.weight * 100)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {group.items.length > VISIBLE_ITEM_COUNT && (
                <button
                  type="button"
                  onClick={() => toggleExpanded(group.target)}
                  aria-expanded={isExpanded}
                  className="mt-4 flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                >
                  <span>
                    {isExpanded
                      ? "이전 기록 접기"
                      : `이전 기록 ${hiddenItemCount}개 보기`}
                  </span>

                  <span
                    aria-hidden="true"
                    className={`transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}