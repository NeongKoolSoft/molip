import type { DailyLog } from "@/types/dailyLog";
import { getPatternInsight } from "@/services/aiInsightService";

type AIInsightCardProps = {
  logs: DailyLog[];
};

export default function AIInsightCard({ logs }: AIInsightCardProps) {
  const insight = getPatternInsight(logs);

  return (
    <div className="mt-10 rounded-2xl border border-blue-100 bg-blue-50 p-5">
      <h2 className="text-xl font-bold mb-3">AI가 발견한 나의 변화</h2>

      <p className="text-gray-700 leading-7">
        최근 기록을 기반으로
        <br />
        반복되는 관심사를 분석했습니다.
      </p>

      <div className="mt-5 rounded-xl bg-white p-4 text-sm text-gray-700 leading-6">
        <p className="font-semibold">{insight.title}</p>
        <p className="mt-2">{insight.description}</p>
      </div>
    </div>
  );
}