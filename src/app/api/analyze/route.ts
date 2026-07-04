import { NextResponse } from "next/server";
import { analyzeLogs } from "@/services/aiInsightService";

export async function POST(request: Request) {
  try {
    const { logs } = await request.json();
    const result = await analyzeLogs(logs);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "AI 분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}