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

const DEFAULT_VISIBLE_ITEM_COUNT = 3;

export default function ReactionTimelineCard({
  userId,
  refreshKey,
}: ReactionTimelineCardProps) {
  const [groups, setGroups] = useState<ReactionTimelineGroup[]>([]);
  const [expandedTarget, setExpandedTarget] = useState<string | null>(
    null
  );
  const [showAllByTarget, setShowAllByTarget] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const load = async () => {
      try {
        const result = await loadReactionTimeline(userId);

        setGroups(result);
        setExpandedTarget(null);
        setShowAllByTarget({});
      } catch (error) {
        console.error("Reaction Timeline 조회 실패:", error);
      }
    };

    load();
  }, [userId, refreshKey]);

  if (groups.length === 0) {
    return null;
  }

  const toggleTarget = (target: string) => {
    setExpandedTarget((current) =>
      current === target ? null : target
    );

    setShowAllByTarget((previous) => ({
      ...previous,
      [target]: false,
    }));
  };

  const toggleShowAll = (target: string) => {
    setShowAllByTarget((previous) => ({
      ...previous,
      [target]: !previous[target],
    }));
  };

  return (
    <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="text-xl font-bold">Reaction Timeline</h2>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        반복된 반응이 언제, 어떤 맥락에서 나타났는지 확인할 수 있습니다.
      </p>

      <div className="mt-5 space-y-3">
        {groups.map((group) => {
          const isExpanded = expandedTarget === group.target;
          const showAll = showAllByTarget[group.target] ?? false;

          const latestItem = group.items[0];

          const visibleItems = showAll
            ? group.items
            : group.items.slice(0, DEFAULT_VISIBLE_ITEM_COUNT);

          const hiddenItemCount = Math.max(
            0,
            group.items.length - DEFAULT_VISIBLE_ITEM_COUNT
          );

          return (
            <div
              key={group.target}
              className="rounded-2xl border border-gray-200 bg-gray-50"
            >
              <button
                type="button"
                onClick={() => toggleTarget(group.target)}
                aria-expanded={isExpanded}
                className="flex w-full items-start justify-between gap-4 p-4 text-left transition hover:bg-gray-100"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {group.target}
                    </h3>

                    {latestItem && (
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {typeLabels[latestItem.type] ?? latestItem.type}
                      </span>
                    )}
                  </div>

                  {latestItem && (
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      최근 반응{" "}
                      {Math.round(latestItem.weight * 100)}% ·{" "}
                      {latestItem.date}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-gray-500">
                    {group.items.length}회 등장
                  </span>

                  <span
                    aria-hidden="true"
                    className={`text-sm text-gray-500 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200 bg-white px-4 pb-4 pt-5">
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

                        <div className="flex-1 rounded-xl border border-gray-200 bg-white p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm text-gray-500">
                              {item.date}
                            </p>

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                              {typeLabels[item.type] ?? item.type}
                            </span>
                          </div>

                          <p className="mt-3 text-sm leading-6 text-gray-700">
                            {item.evidence}
                          </p>

                          <p className="mt-2 text-xs text-gray-500">
                            반응 강도{" "}
                            {Math.round(item.weight * 100)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {group.items.length >
                    DEFAULT_VISIBLE_ITEM_COUNT && (
                    <button
                      type="button"
                      onClick={() => toggleShowAll(group.target)}
                      aria-expanded={showAll}
                      className="mt-4 flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                    >
                      <span>
                        {showAll
                          ? "이전 기록 접기"
                          : `이전 기록 ${hiddenItemCount}개 보기`}
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
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}