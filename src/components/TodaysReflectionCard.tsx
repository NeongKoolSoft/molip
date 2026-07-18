"use client";

import { useEffect, useState } from "react";

import type { TodaysReflection } from "@/types/todaysReflection";
import { getTodayTodaysReflection } from "@/services/todaysReflectionAnalysisService";

type TodaysReflectionCardProps = {
  userId: string;
  refreshKey: number;
};

export default function TodaysReflectionCard({
  userId,
  refreshKey,
}: TodaysReflectionCardProps) {
  const [reflection, setReflection] =
    useState<TodaysReflection | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadReflection = async () => {
      setLoading(true);
      setMessage("");

      try {
        const result =
          await getTodayTodaysReflection(userId);

        setReflection(result);
      } catch (error) {
        console.error(
          "Today's Reflection 조회 실패:",
          error
        );

        setReflection(null);
        setMessage(
          "오늘의 흐름을 불러오는 중 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    loadReflection();
  }, [userId, refreshKey]);

  if (loading) {
    return (
      <section className="mt-10 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
        <p className="text-sm text-gray-500">
          오늘 기록의 흐름을 불러오고 있습니다.
        </p>
      </section>
    );
  }

  if (message) {
    return (
      <section className="mt-10 rounded-2xl border border-red-100 bg-red-50 p-5">
        <p className="text-sm text-red-500">
          {message}
        </p>
      </section>
    );
  }

  if (!reflection) {
    return (
      <section className="mt-10 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
        <h2 className="text-xl font-bold">
          🌱 오늘 Molip이 발견한 흐름
        </h2>

        <div className="mt-4 rounded-xl bg-white p-4">
          <p className="leading-7 text-gray-700">
            아직 오늘의 흐름이 만들어지지 않았습니다.
          </p>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            오늘 기록을 저장하고 AI 분석을 실행하면,
            기록과 생각의 변화를 연결한 한 문단이
            이곳에 나타납니다.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
      <h2 className="text-xl font-bold">
        🌱 오늘 Molip이 발견한 흐름
      </h2>

      <div className="mt-4 rounded-xl bg-white p-5">
        <p className="whitespace-pre-line text-base leading-8 text-gray-700">
          {reflection.reflection}
        </p>
      </div>

      <p className="mt-4 text-xs leading-5 text-gray-500">
        이 내용은 오늘의 기록과 최근 반복된 반응,
        생각의 변화를 연결한 것입니다.
        사용자를 평가하거나 정의하는 결과가 아니며,
        최종적인 해석과 선택은 언제나 사용자의 몫입니다.
      </p>
    </section>
  );
}