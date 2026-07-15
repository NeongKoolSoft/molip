"use client";

import { useState } from "react";

import type { DailyLog } from "@/types/dailyLog";

type RecentLogsProps = {
  logs: DailyLog[];
};

function LogCard({
  log,
  isToday = false,
}: {
  log: DailyLog;
  isToday?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      {isToday && (
        <p className="mb-2 text-sm font-semibold text-blue-600">
          오늘
        </p>
      )}

      <p className="text-sm text-gray-500">{log.log_date}</p>

      <p className="mt-3 whitespace-pre-line leading-7 text-gray-800">
        {log.content}
      </p>
    </div>
  );
}

export default function RecentLogs({
  logs,
}: RecentLogsProps) {
  const [showPrevious, setShowPrevious] = useState(false);

  if (logs.length === 0) {
    return null;
  }

  const today = new Date().toISOString().slice(0, 10);

  const todayLog =
    logs.find((log) => log.log_date === today) ?? logs[0];

  const previousLogs = logs.filter(
    (log) => log.id !== todayLog.id
  );

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold">최근 기록</h2>

      <div className="mt-5">
        <LogCard log={todayLog} isToday />
      </div>

      {previousLogs.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() =>
              setShowPrevious((previous) => !previous)
            }
            aria-expanded={showPrevious}
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            <span>
              {showPrevious
                ? "이전 기록 접기"
                : `이전 기록 보기 (${previousLogs.length})`}
            </span>

            <span
              className={`transition-transform ${
                showPrevious ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            >
              ▼
            </span>
          </button>

          {showPrevious && (
            <div className="mt-4 space-y-4">
              {previousLogs.map((log) => (
                <LogCard key={log.id} log={log} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}