"use client";

import { useEffect, useState } from "react";
import type { ReactionTrend } from "@/services/reactionTrendService";
import { loadReactionTrends } from "@/services/reactionTrendService";

type ReactionTrendCardProps = {
  userId: string;
};

const trendLabels = {
  increasing: "증가",
  stable: "유지",
  decreasing: "감소",
};

const trendMarks = {
  increasing: "↗",
  stable: "→",
  decreasing: "↘",
};

export default function ReactionTrendCard({ userId }: ReactionTrendCardProps) {
  const [trends, setTrends] = useState<ReactionTrend[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await loadReactionTrends(userId);
        setTrends(result);
      } catch (error) {
        console.error(error);
      }
    };

    load();
  }, [userId]);

  if (trends.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="text-xl font-bold mb-4">최근 반응 변화</h2>

      <div className="space-y-4">
        {trends.map((item) => (
          <div key={item.target}>
            <div className="flex justify-between text-sm">
              <span className="font-semibold">{item.target}</span>
              <span>
                {trendMarks[item.trend]} {trendLabels[item.trend]}
              </span>
            </div>

            <div className="mt-2 h-3 rounded-full bg-gray-100">
              <div
                className="h-3 rounded-full bg-blue-600"
                style={{ width: `${Math.round(item.avgWeight * 100)}%` }}
              />
            </div>

            <p className="mt-1 text-xs text-gray-500">
              평균 반응 강도 {Math.round(item.avgWeight * 100)}% · {item.count}회 등장
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}