import type { DailyLog } from "@/types/dailyLog";

type RecentLogsProps = {
  logs: DailyLog[];
};

export default function RecentLogs({ logs }: RecentLogsProps) {
  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4">최근 기록</h2>

      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">{log.log_date}</p>
            <p className="mt-2 whitespace-pre-wrap">{log.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}