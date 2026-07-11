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
  signUp,
  login,
  logout,
  getCurrentUser,
} from "@/services/authService";

import { deleteTodayAnalysis } from "@/services/aiAnalysisService";
import { saveLogRevision } from "@/services/logRevisionService";

import LoginForm from "@/components/LoginForm";
import DailyLogForm from "@/components/DailyLogForm";
import RecentLogs from "@/components/RecentLogs";
import AIInsightCard from "@/components/AIInsightCard";
import ReactionTrendCard from "@/components/ReactionTrendCard";
import ReactionTimelineCard from "@/components/ReactionTimelineCard";
import GrowthSignalCard from "@/components/GrowthSignalCard";
import MeaningGrowthCard from "@/components/MeaningGrowthCard";
import { deleteTodayMeaningGrowthAnalysis } from "@/services/meaningGrowthAnalysisService";
import ImmersionDiscoveryCard from "@/components/ImmersionDiscoveryCard";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [logs, setLogs] = useState<DailyLog[]>([]);

  const [analysisVersion, setAnalysisVersion] = useState(0);
  const [timelineVersion, setTimelineVersion] = useState(0);
  const [meaningGrowthVersion, setMeaningGrowthVersion] = useState(0);

  const refreshLogs = async (userId: string) => {
    const todayContent = await loadTodayLog(userId);
    const recentLogs = await loadRecentLogs(userId);

    setContent(todayContent);
    setLogs(recentLogs);
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();

        if (currentUser) {
          setUser(currentUser);
          await refreshLogs(currentUser.id);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadUser();
  }, []);

  const handleSignUp = async () => {
    setMessage("");

    if (!email.trim()) {
      setMessage("이메일을 입력해 주세요.");
      return;
    }

    if (password.length < 6) {
      setMessage("비밀번호는 6자 이상 입력해 주세요.");
      return;
    }

    try {
      await signUp(email, password);
      setMessage("회원가입 완료. 로그인해 주세요.");
    } catch (error) {
      console.error(error);
      setMessage("회원가입 중 오류가 발생했습니다.");
    }
  };

  const handleLogin = async () => {
    setMessage("");

    try {
      const loggedInUser = await login(email, password);

      setUser(loggedInUser);
      await refreshLogs(loggedInUser.id);
    } catch (error) {
      console.error(error);
      setMessage("로그인 중 오류가 발생했습니다.");
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
      // 저장 전 오늘 기록을 조회한다.
      const previousLog = await loadTodayLogRow(user.id);

      // 기존 내용과 같으면 저장하지 않는다.
      if (previousLog?.content.trim() === trimmedContent) {
        setMessage("변경된 내용이 없습니다.");
        return;
      }

      // daily_logs에는 항상 최신 기록을 저장한다.
      const savedLog = await saveTodayLog(user.id, trimmedContent);

      if (!previousLog) {
        // 오늘의 최초 기록
        await saveLogRevision({
          userId: user.id,
          dailyLogId: savedLog.id,
          logDate: savedLog.log_date,
          content: savedLog.content,
          source: "initial",
        });
      } else {
        // 기존 Revision이 없을 수 있으므로 수정 전 기록도 먼저 보존한다.
        await saveLogRevision({
          userId: user.id,
          dailyLogId: previousLog.id,
          logDate: previousLog.log_date,
          content: previousLog.content,
          source: "initial",
        });

        // 수정된 최신 기록을 다음 Revision으로 저장한다.
        await saveLogRevision({
          userId: user.id,
          dailyLogId: savedLog.id,
          logDate: savedLog.log_date,
          content: savedLog.content,
          source: "manual_edit",
        });
      }

      // 기록이 변경됐으므로 기존 AI 분석 결과를 삭제한다.
      await deleteTodayAnalysis(user.id);
      await deleteTodayMeaningGrowthAnalysis(user.id);

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
        email={email}
        password={password}
        message={message}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSignUp={handleSignUp}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8">
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
        />

        <GrowthSignalCard
          userId={user.id}
          refreshKey={analysisVersion}
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