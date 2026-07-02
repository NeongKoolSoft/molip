"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import type { DailyLog } from "@/types/dailyLog";
import {
  loadTodayLog,
  loadRecentLogs,
  saveTodayLog,
} from "@/services/dailyLogService";
import {
  signUp,
  login,
  logout,
  getCurrentUser,
} from "@/services/authService";

import LoginForm from "@/components/LoginForm";
import DailyLogForm from "@/components/DailyLogForm";
import RecentLogs from "@/components/RecentLogs";
import AIInsightCard from "@/components/AIInsightCard";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [logs, setLogs] = useState<DailyLog[]>([]);

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

    if (!content.trim()) {
      setMessage("기록을 입력해 주세요.");
      return;
    }

    try {
      await saveTodayLog(user.id, content);
      await refreshLogs(user.id);
      setMessage("오늘의 기록이 저장되었습니다.");
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
        <AIInsightCard logs={logs} />
      </div>
    </main>
  );
}