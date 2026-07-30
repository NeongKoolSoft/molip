"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { UserPlan } from "@/types/userPlan";
import { loadUserPlan } from "@/services/userPlanService";

import type { DailyLog } from "@/types/dailyLog";

import {
  loadTodayLog,
  loadTodayLogRow,
  loadRecentLogs,
  saveTodayLog,
} from "@/services/dailyLogService";

import { login, logout, getCurrentUser } from "@/services/authService";

import { deleteTodayAnalysis } from "@/services/aiAnalysisService";
import { saveLogRevision } from "@/services/logRevisionService";
import { deleteTodayMeaningGrowthAnalysis } from "@/services/meaningGrowthAnalysisService";
import { deleteTodayTodaysReflection } from "@/services/todaysReflectionAnalysisService";

import { supabase } from "@/lib/supabase";

import LoginForm from "@/components/LoginForm";
import DailyLogForm from "@/components/DailyLogForm";
import RecentLogs from "@/components/RecentLogs";
import AIInsightCard from "@/components/AIInsightCard";
//import ReflectionQuestionDevCard from "@/components/ReflectionQuestionDevCard";
import ReactionTrendCard from "@/components/ReactionTrendCard";
import ReactionTimelineCard from "@/components/ReactionTimelineCard";
import GrowthSignalCard from "@/components/GrowthSignalCard";
import MeaningGrowthCard from "@/components/MeaningGrowthCard";
import ImmersionDiscoveryV2Card from "@/components/ImmersionDiscoveryV2Card";
import TodaysReflectionCard from "@/components/TodaysReflectionCard";
import WeeklyReportCard from "@/components/WeeklyReportCard";

declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: string,
      parameters?: Record<string, unknown>
    ) => void;
  }
}

function trackGoogleAdsSignup(currentUser: User) {
  if (typeof window === "undefined" || !window.gtag) {
    return;
  }

  const trackedKey = `molip_google_ads_signup_tracked_${currentUser.id}`;

  if (window.localStorage.getItem(trackedKey)) {
    return;
  }

  const createdAt = new Date(currentUser.created_at).getTime();
  const lastSignInAt = currentUser.last_sign_in_at
    ? new Date(currentUser.last_sign_in_at).getTime()
    : createdAt;

  const accountAge = Date.now() - createdAt;
  const creationLoginGap = Math.abs(lastSignInAt - createdAt);

  // 계정 생성 직후의 최초 로그인만 가입으로 처리
  const isNewSignup =
    accountAge >= 0 &&
    accountAge < 30 * 60 * 1000 &&
    creationLoginGap < 5 * 60 * 1000;

  if (!isNewSignup) {
    return;
  }

  window.gtag("event", "conversion", {
    send_to: "AW-17811031025/IBnsCIXd_dgcEPGH-6xC",
  });

  window.localStorage.setItem(trackedKey, new Date().toISOString());
}

function getLocalDateKey(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlan>("free");

  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [isInitialContentLoaded, setIsInitialContentLoaded] =
    useState(false);

  const [analysisVersion, setAnalysisVersion] = useState(0);
  const [timelineVersion, setTimelineVersion] = useState(0);
  const [meaningGrowthVersion, setMeaningGrowthVersion] = useState(0);
  const [todaysReflectionVersion, setTodaysReflectionVersion] =
    useState(0);
  const [weeklyReportVersion, setWeeklyReportVersion] = useState(0);

  const draftKey = useMemo(() => {
    if (!user) {
      return null;
    }

    return `molip_daily_log_draft_${user.id}_${getLocalDateKey()}`;
  }, [user]);

  const refreshLogs = async (userId: string) => {
    const todayContent = await loadTodayLog(userId);
    const recentLogs = await loadRecentLogs(userId);

    const currentDraftKey = `molip_daily_log_draft_${userId}_${getLocalDateKey()}`;
    const savedDraft = window.localStorage.getItem(currentDraftKey);

    if (savedDraft !== null) {
      setContent(savedDraft);
    } else {
      setContent(todayContent);
    }

    setLogs(recentLogs);
    setIsInitialContentLoaded(true);
  };

  useEffect(() => {
    let isMounted = true;

    const applyUser = async (currentUser: User | null) => {
      if (!isMounted) {
        return;
      }

      setUser(currentUser);
      setIsInitialContentLoaded(false);

      if (currentUser) {
        trackGoogleAdsSignup(currentUser);

      const [todayContent, recentLogs, plan] = await Promise.all([
          loadTodayLog(currentUser.id),
          loadRecentLogs(currentUser.id),
          loadUserPlan(currentUser.id),
        ]);

        if (!isMounted) {
          return;
        }

        setUserPlan(plan);

        const currentDraftKey = `molip_daily_log_draft_${
          currentUser.id
        }_${getLocalDateKey()}`;

        const savedDraft =
          typeof window !== "undefined"
            ? window.localStorage.getItem(currentDraftKey)
            : null;

        if (savedDraft !== null) {
          setContent(savedDraft);
        } else {
          setContent(todayContent);
        }

        setLogs(recentLogs);
        setIsInitialContentLoaded(true);
      } else {
        setContent("");
        setLogs([]);
        setIsInitialContentLoaded(false);
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

  useEffect(() => {
    if (!draftKey || !isInitialContentLoaded) {
      return;
    }

    if (content.trim()) {
      window.localStorage.setItem(draftKey, content);
    } else {
      window.localStorage.removeItem(draftKey);
    }
  }, [content, draftKey, isInitialContentLoaded]);

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
      setUserPlan("free");
      setContent("");
      setLogs([]);
      setMessage("로그아웃되었습니다.");
      setIsInitialContentLoaded(false);
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

      setIsInitialContentLoaded(false);

      if (draftKey) {
        window.localStorage.removeItem(draftKey);
      }

      await refreshLogs(user.id);

      setAnalysisVersion((previous) => previous + 1);

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
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
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
          onAnalysisComplete={() => {
            setTimelineVersion((prev) => prev + 1);
            setWeeklyReportVersion((prev) => prev + 1);
          }}
          onMeaningGrowthComplete={() =>
            setMeaningGrowthVersion((previous) => previous + 1)
          }
          onTodaysReflectionComplete={() =>
            setTodaysReflectionVersion((previous) => previous + 1)
          }
        />

{/*
        <ReflectionQuestionDevCard
          userId={user.id}
        />
*/}

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

        <ImmersionDiscoveryV2Card
          userId={user.id}
          refreshKey={analysisVersion}
        />

        <WeeklyReportCard
          userId={user.id}
          plan={userPlan}
          refreshKey={weeklyReportVersion}
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