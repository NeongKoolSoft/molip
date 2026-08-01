import { NextResponse } from "next/server";

import {
  analyzeReflectionContextOnServer,
} from "@/services/reflectionContextAnalysisServerService";

import type {
  AIInsight,
} from "@/services/aiInsightService";

type ReflectionContextRequest = {
  latestRecord?: unknown;
  aiInsight?: unknown;
};

export async function POST(
  request: Request
) {
  try {
    const body =
      (await request.json()) as ReflectionContextRequest;

    const {
      latestRecord,
      aiInsight,
    } = body;

    if (
      typeof latestRecord !==
        "string" ||
      !latestRecord.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "분석할 오늘 기록이 없습니다.",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await analyzeReflectionContextOnServer({
        latestRecord,
        aiInsight:
          aiInsight &&
          typeof aiInsight ===
            "object"
            ? (aiInsight as AIInsight)
            : null,
      });

    return NextResponse.json(
      result
    );
  } catch (error) {
    console.error(
      "Reflection Context 분석 오류:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Reflection Context 분석 중 오류가 발생했습니다.",
      },
      {
        status: 500,
      }
    );
  }
}