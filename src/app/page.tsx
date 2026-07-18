"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import type { DailyLog } from "@/types/dailyLog";

import {
  loadTodayLog,
  loadTodayLogRow,
  loadRecentLogs,
  saveTodayLog,
} from "@/services/dailyLogService";

import {
  login,
  logout,
  getCurrentUser,
} from "@/services/authService";

import { deleteTodayAnalysis } from "@/services/aiAnalysisService";
import { saveLogRevision } from "@/services/logRevisionService";
import { deleteTodayMeaningGrowthAnalysis } from "@/services/meaningGrowthAnalysisService";
import { deleteTodayTodaysReflection } from "@/services/todaysReflectionAnalysisService";

import { supabase } from "@/lib/supabase";

import LoginForm from "@/components/LoginForm";
import DailyLogForm from "@/components/DailyLogForm";
import RecentLogs from "@/components/RecentLogs";
import AIInsightCard from "@/components/AIInsightCard";
import ReactionTrendCard from "@/components/ReactionTrendCard";
import ReactionTimelineCard from "@/components/ReactionTimelineCard";
import GrowthSignalCard from "@/components/GrowthSignalCard";
import MeaningGrowthCard from "@/components/MeaningGrowthCard";
import ImmersionDiscoveryCard from "@/components/ImmersionDiscoveryCard";
import TodaysReflectionCard from "@/components/TodaysReflectionCard";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [logs, setLogs] = useState<DailyLog[]>([]);

  const [analysisVersion, setAnalysisVersion] = useState(0);
  const [timelineVersion, setTimelineVersion] = useState(0);
  const [meaningGrowthVersion, setMeaningGrowthVersion] = useState(0);
  const [todaysReflectionVersion, setTodaysReflectionVersion] = useState(0);

  const refreshLogs = async (userId: string) => {
    const todayContent = await loadTodayLog(userId);
    const recentLogs = await loadRecentLogs(userId);

    setContent(todayContent);
    setLogs(recentLogs);
  };

  useEffect(() => {
    let isMounted = true;

    const applyUser = async (currentUser: User | null) => {
      if (!isMounted) {
        return;
      }

      setUser(currentUser);

      if (currentUser) {
        await refreshLogs(currentUser.id);
      } else {
        setContent("");
        setLogs([]);
      }
    };

    const loadInitialUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        await applyUser(currentUser);
      } catch (error) {
        console.error("초기 로그인 상태 확인 실패:", error);
      }
    };

    loadInitialUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => {
        applyUser(session?.user ?? null).catch((error) => {
          console.error("로그인 상태 반영 실패:", error);
        });
      }, 0);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    setMessage("");

    try {
      await login();
    } catch (error) {
      console.error(error);
      setMessage("Google 로그인 중 오류가 발생했습니다.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();

      setUser(null);
      setContent("");
      setLogs([]);
      setMessage("로그아웃되었습니다.");
    } catch (error) {
      console.error(error);
      setMessage("로그아웃 중 오류가 발생했습니다.");
    }
  };

  const handleSave = async () => {
    setMessage("");

    if (!user) {
      setMessage("로그인이 필요합니다.");
      return;
    }

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      setMessage("기록을 입력해 주세요.");
      return;
    }

    try {
      const previousLog = await loadTodayLogRow(user.id);

      if (previousLog?.content.trim() === trimmedContent) {
        setMessage("변경된 내용이 없습니다.");
        return;
      }

      const savedLog = await saveTodayLog(user.id, trimmedContent);

      if (!previousLog) {
        await saveLogRevision({
          userId: user.id,
          dailyLogId: savedLog.id,
          logDate: savedLog.log_date,
          content: savedLog.content,
          source: "initial",
        });
      } else {
        await saveLogRevision({
          userId: user.id,
          dailyLogId: previousLog.id,
          logDate: previousLog.log_date,
          content: previousLog.content,
          source: "initial",
        });

        await saveLogRevision({
          userId: user.id,
          dailyLogId: savedLog.id,
          logDate: savedLog.log_date,
          content: savedLog.content,
          source: "manual_edit",
        });
      }

      await deleteTodayAnalysis(user.id);
      await deleteTodayMeaningGrowthAnalysis(user.id);
      await deleteTodayTodaysReflection(user.id);

      await refreshLogs(user.id);

      setAnalysisVersion((prev) => prev + 1);

      setMessage(
        previousLog
          ? "수정된 기록이 저장되었습니다. AI 분석을 다시 실행해 주세요."
          : "오늘의 기록이 저장되었습니다. AI 분석을 실행해 주세요."
      );
    } catch (error) {
      console.error(error);
      setMessage("저장 중 오류가 발생했습니다.");
    }
  };

  if (!user) {
    return (
      <LoginForm
        message={message}
        onGoogleLogin={handleGoogleLogin}
      />
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-lg">
        <DailyLogForm
          content={content}
          message={message}
          onContentChange={setContent}
          onSave={handleSave}
          onLogout={handleLogout}
        />

        <RecentLogs logs={logs} />

        <AIInsightCard
          userId={user.id}
          logs={logs}
          refreshKey={analysisVersion}
          onAnalysisComplete={() =>
            setTimelineVersion((prev) => prev + 1)
          }
          onMeaningGrowthComplete={() =>
            setMeaningGrowthVersion((prev) => prev + 1)
          }
          onTodaysReflectionComplete={() =>
            setTodaysReflectionVersion((prev) => prev + 1)
          }
        />

        <GrowthSignalCard
          userId={user.id}
          refreshKey={analysisVersion}
        />

        <TodaysReflectionCard
          userId={user.id}
          refreshKey={todaysReflectionVersion}
        />  

        <MeaningGrowthCard
          userId={user.id}
          refreshKey={meaningGrowthVersion}
        />

        <ImmersionDiscoveryCard
          userId={user.id}
          refreshKey={analysisVersion}
        />

        <ReactionTrendCard userId={user.id} />

        <ReactionTimelineCard
          userId={user.id}
          refreshKey={timelineVersion}
        />
      </div>
    </main>
  );
}