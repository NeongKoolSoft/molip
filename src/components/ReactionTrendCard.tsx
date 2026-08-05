"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import type {
  UserPlan,
} from "@/types/userPlan";

import type {
  ReactionTrend,
} from "@/services/reactionTrendService";

import {
  loadReactionTrends,
} from "@/services/reactionTrendService";

type ReactionTrendCardProps = {
  userId: string;
  plan: UserPlan;
  refreshKey: number;
};

const trendLabels: Record<
  ReactionTrend["trend"],
  string
> = {
  increasing: "증가",
  stable: "유지",
  decreasing: "감소",
};

const trendMarks: Record<
  ReactionTrend["trend"],
  string
> = {
  increasing: "↗",
  stable: "→",
  decreasing: "↘",
};

export default function ReactionTrendCard({
  userId,
  plan,
  refreshKey,
}: ReactionTrendCardProps) {
  const [trends, setTrends] =
    useState<ReactionTrend[]>([]);

  const [loading, setLoading] =
    useState(plan === "plus");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  useEffect(() => {
    let isMounted = true;

    if (plan !== "plus") {
      setTrends([]);
      setLoading(false);
      setErrorMessage("");

      return () => {
        isMounted = false;
      };
    }

    const load = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const result =
          await loadReactionTrends(
            userId
          );

        if (!isMounted) {
          return;
        }

        setTrends(result);
      } catch (error) {
        console.error(
          "최근 반응 변화 조회 실패:",
          error
        );

        if (!isMounted) {
          return;
        }

        setTrends([]);

        setErrorMessage(
          "최근 반응 변화를 불러오지 못했습니다."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [
    userId,
    plan,
    refreshKey,
  ]);

  if (plan !== "plus") {
    return (
      <section className="mt-10 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <Link
          href="/plus"
          className="group block rounded-xl border border-indigo-100 bg-white p-4 transition hover:border-indigo-200 hover:bg-indigo-50"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">
                Molip Plus에서 이용할 수 있습니다.
              </p>

              <p className="mt-2 break-keep text-sm leading-6 text-gray-600">
                여러 날의 기록을 연결해 반복되는 반응과
                변화의 방향을 함께 확인해 보세요.
              </p>
            </div>

            <span
              aria-hidden="true"
              className="shrink-0 font-bold text-indigo-600 transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </div>
        </Link>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="mt-10 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <p className="text-sm text-gray-500">
          최근 반응의 변화를 연결하고 있습니다.
        </p>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="mt-10 rounded-2xl border border-red-100 bg-red-50 p-5">
        <h2 className="text-xl font-bold">
          최근 반응 변화
        </h2>

        <p className="mt-3 leading-7 text-red-700">
          {errorMessage}
        </p>
      </section>
    );
  }

  if (trends.length === 0) {
    return null;
  }

  return (
    <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-bold text-slate-950">
        최근 반응 변화
      </h2>

      <div className="mt-5 space-y-5">
        {trends.map((item) => {
          const percentage =
            Math.round(
              item.avgWeight * 100
            );

          return (
            <article
              key={item.target}
              className="rounded-xl border border-slate-100 bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-3 text-sm">
                <span className="min-w-0 break-keep font-semibold text-slate-950">
                  {item.target}
                </span>

                <span className="shrink-0 font-medium text-slate-700">
                  {
                    trendMarks[
                      item.trend
                    ]
                  }{" "}
                  {
                    trendLabels[
                      item.trend
                    ]
                  }
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{
                    width:
                      `${percentage}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                평균 반응 강도{" "}
                {percentage}% ·{" "}
                {item.count}회 등장
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}