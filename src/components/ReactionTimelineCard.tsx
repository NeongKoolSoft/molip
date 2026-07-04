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

export default function ReactionTimelineCard({
  userId,
  refreshKey,
}: ReactionTimelineCardProps) {
  const [groups, setGroups] = useState<ReactionTimelineGroup[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await loadReactionTimeline(userId);
        setGroups(result);
      } catch (error) {
        console.error(error);
      }
    };

    load();
  }, [userId, refreshKey]);

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="text-xl font-bold mb-4">Reaction Timeline</h2>

      <div className="space-y-8">
        {groups.map((group) => (
          <div key={group.target}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">{group.target}</h3>
              <span className="text-xs text-gray-500">
                {group.items.length}회 등장
              </span>
            </div>

            <div className="space-y-4">
              {group.items.map((item, index) => (
                <div key={`${item.date}-${item.type}-${index}`} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="mt-1 h-3 w-3 rounded-full bg-blue-600" />
                    {index < group.items.length - 1 && (
                      <div className="mt-1 h-full min-h-16 w-px bg-gray-200" />
                    )}
                  </div>

                  <div className="flex-1 rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-gray-500">{item.date}</p>

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                        {typeLabels[item.type] ?? item.type}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-gray-700">{item.evidence}</p>

                    <p className="mt-2 text-xs text-gray-500">
                      반응 강도 {Math.round(item.weight * 100)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}