"use client";

import { useState } from "react";

import { getTodayAnalysis } from "@/services/aiAnalysisService";
import { loadRecentLogs } from "@/services/dailyLogService";

import {
  createReflectionLoopContext,
} from "@/services/reflectionLoopService";

import {
  createQuestionContext,
} from "@/services/questionContextService";

import {
  generateReflectionQuestion,
} from "@/services/reflectionQuestionService";

import type {
  ReflectionLoopContext,
  ReflectionQuestionIntent,
  ReflectionQuestionResult,
  ReflectionState,
} from "@/types/reflectionLoop";

import type {
  ReflectionQuestionContextV2,
} from "@/types/reflectionContext";

type Props = {
  userId: string;
};

const stateLabel: Record<ReflectionState, string> = {
  observation: "관찰",
  description: "구체화",
  connection: "연결",
  discovery: "발견",
  integration: "통합",
};

const intentLabel: Record<
  ReflectionQuestionIntent,
  string
> = {
  describe: "구체적으로 표현하기",
  connect: "관계 연결하기",
  discover: "의미 발견하기",
  integrate: "삶의 흐름과 연결하기",
};

const getQuestionIntent = (
  targetState: ReflectionState
): ReflectionQuestionIntent => {
  switch (targetState) {
    case "observation":
    case "description":
      return "describe";

    case "connection":
      return "connect";

    case "discovery":
      return "discover";

    case "integration":
      return "integrate";
  }
};

export default function ReflectionQuestionDevCard({
  userId,
}: Props) {
  const [result, setResult] =
    useState<ReflectionQuestionResult | null>(null);

  const [loopContext, setLoopContext] =
    useState<ReflectionLoopContext | null>(null);

  const [questionContext, setQuestionContext] =
    useState<ReflectionQuestionContextV2 | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const [logs, aiInsight] = await Promise.all([
        loadRecentLogs(userId),
        getTodayAnalysis(userId),
      ]);

      if (logs.length === 0) {
        throw new Error(
          "Question Engine V3를 시험할 기록이 없습니다."
        );
      }

      const createdLoopContext =
        createReflectionLoopContext({
          logs,
          aiInsight,
        });

      const createdQuestionContext =
        createQuestionContext({
          logs,
          loopContext: createdLoopContext,
          aiInsight,
        });

      const generatedQuestion =
        await generateReflectionQuestion(
          createdQuestionContext
        );

      setLoopContext(createdLoopContext);
      setQuestionContext(createdQuestionContext);
      setResult(generatedQuestion);
    } catch (error) {
      console.error(
        "Question Engine V3 테스트 실패:",
        error
      );

      setLoopContext(null);
      setQuestionContext(null);
      setResult(null);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Question Engine V3 테스트에 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const questionIntent = questionContext
    ? getQuestionIntent(
        questionContext.local.targetState
      )
    : null;

  const focus =
    questionContext?.local.mainThread?.focus ??
    questionContext?.local.mainThread?.target ??
    questionContext?.local.latestFocus ??
    questionContext?.global.primaryTarget ??
    null;    

  const evidence =
    questionContext?.local.recentEvidence ?? [];

  return (
    <section className="mt-10 rounded-2xl border border-orange-200 bg-orange-50 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-orange-700">
            Development
          </p>

          <h2 className="mt-2 text-xl font-bold">
            Question Engine V3 테스트
          </h2>
        </div>

        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-orange-700">
          화면 미적용
        </span>
      </div>

      <p className="mt-4 leading-7 text-gray-700">
        기존 질문은 유지한 채 최근 기록으로 V3 질문을
        독립 생성합니다.
      </p>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="mt-5 w-full rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "V3 질문을 만들고 있습니다..."
          : "V3 질문 생성해 보기"}
      </button>

      {errorMessage && (
        <p className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 leading-7 text-red-700">
          {errorMessage}
        </p>
      )}

      {loopContext &&
        questionContext &&
        result &&
        questionIntent && (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-orange-100 bg-white p-4">
              <p className="text-xs font-semibold text-orange-700">
                Reflection 상태
              </p>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">
                    현재 상태
                  </p>

                  <p className="mt-1 font-semibold">
                    {
                      stateLabel[
                        loopContext.currentState
                      ]
                    }
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">
                    목표 상태
                  </p>

                  <p className="mt-1 font-semibold">
                    {
                      stateLabel[
                        loopContext.targetState
                      ]
                    }
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-gray-600">
                {loopContext.reason}
              </p>
            </div>

            <div className="rounded-xl border border-orange-100 bg-white p-4">
              <p className="text-xs font-semibold text-orange-700">
                질문 방향
              </p>

              <p className="mt-2 font-semibold text-gray-900">
                {intentLabel[questionIntent]}
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                중심 흐름: {focus ?? "특정되지 않음"}
              </p>
            </div>

            {evidence.length > 0 && (
              <div className="rounded-xl border border-orange-100 bg-white p-4">
                <p className="text-xs font-semibold text-orange-700">
                  사용한 기록 근거
                </p>

                <ul className="mt-3 space-y-2">
                  {evidence.map(
                    (item, index) => (
                      <li
                        key={`${item}-${index}`}
                        className="text-sm leading-6 text-gray-600"
                      >
                        · {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {questionContext.local.mainThread && (
              <p className="mt-2 text-sm leading-6 text-gray-600">
                선택 이유:{" "}
                {questionContext.local.mainThread.reason}
              </p>
            )}

            {questionContext.local.mainThread && (
              <div className="mt-3 space-y-2 text-sm leading-6 text-gray-600">
                <p>
                중심 주제:{" "}
                {questionContext.local.mainThread.target}
                </p>

                <p>
                현재 초점:{" "}
                {questionContext.local.mainThread.focus}
                </p>

                <p>
                선택 이유:{" "}
                {questionContext.local.mainThread.focusReason}
                </p>
              </div>
            )}

            <div className="rounded-xl border border-green-200 bg-green-50 p-5">
              <p className="text-sm font-semibold text-green-800">
                Question Engine V3
              </p>

              <p className="mt-3 text-lg font-semibold leading-8 text-gray-900">
                {result.question}
              </p>
            </div>
          </div>
        )}
    </section>
  );
}