import type { DailyLog } from "@/types/dailyLog";
import { generateGeminiText } from "@/providers/geminiProvider";

export type AIInsight = {
  reaction_targets: string[];
  summary: string;
  question: string;
};

export async function analyzeLogs(logs: DailyLog[]): Promise<AIInsight> {
  const prompt = `
너는 Molip의 분석 엔진이다.

사용자의 기록을 읽고 감정 평가가 아니라
"반복적으로 반응한 대상"을 추출하라.

반드시 JSON만 반환하라.
마크다운 코드블록은 사용하지 마라.

형식:
{
  "reaction_targets": ["운동", "AI 개발"],
  "summary": "최근 사용자는 운동과 AI 개발에 반복적으로 반응하고 있습니다.",
  "question": "운동과 AI 개발 중 더 오래 마음에 남은 것은 무엇인가요?"
}

사용자 기록:
${JSON.stringify(logs, null, 2)}
`;

  const text = await generateGeminiText(prompt);

  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
}