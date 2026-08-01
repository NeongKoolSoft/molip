import type {
  AIInsight,
} from "@/services/aiInsightService";

import type {
  ReflectionContextAnalysis,
} from "@/types/reflectionContextAnalysis";

export const analyzeReflectionContext =
  async ({
    latestRecord,
    aiInsight,
  }: {
    latestRecord: string;
    aiInsight: AIInsight | null;
  }): Promise<ReflectionContextAnalysis> => {
    const response = await fetch(
      "/api/reflection-context",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          latestRecord,
          aiInsight,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        "Reflection Context 분석에 실패했습니다."
      );
    }

    return response.json();
  };