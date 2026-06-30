"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
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

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("회원가입 완료. 로그인해 주세요.");
  };

  const handleLogin = async () => {
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setUser(data.user);
    setMessage("");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setContent("");
    setMessage("로그아웃되었습니다.");
  };

  const handleSave = async () => {
    setMessage("");

    if (!user) {
      setMessage("로그인이 필요합니다.");
      return;
    }

    console.log("current user id:", user.id);

    if (!content.trim()) {
      setMessage("기록을 입력해 주세요.");
      return;
    }

    const { error } = await supabase.from("daily_logs").upsert(
      {
        user_id: user.id,
        log_date: new Date().toISOString().slice(0, 10),
        content: content.trim(),
      },
      {
        onConflict: "user_id,log_date",
      }
    );

    if (error) {
      console.error(error);
      setMessage(error.message);
      return;
    }

    setMessage("오늘의 기록이 저장되었습니다.");
  };

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-5xl font-bold text-center">Molip</h1>

          <p className="mt-6 text-center text-gray-600 leading-8">
            오늘 무엇이 가장 오래 마음에 남았나요?
          </p>

          <div className="mt-10 space-y-4">
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={handleSignUp}
              className="w-full rounded-xl bg-gray-800 py-3 text-white font-semibold"
            >
              회원가입
            </button>

            <button
              onClick={handleLogin}
              className="w-full rounded-xl bg-blue-600 py-3 text-white font-semibold"
            >
              로그인
            </button>
          </div>

          {message && (
            <p className="mt-4 text-center text-sm text-gray-600">{message}</p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Molip</h1>

          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            로그아웃
          </button>
        </div>

        <p className="mt-6 text-center text-gray-600 leading-8">
          오늘 무엇이 가장 오래 마음에 남았나요?
          <br />
          <br />
          기억에 남은 일,
          <br />
          계속 생각났던 일,
          <br />
          자꾸 신경 쓰였던 일을
          <br />
          편하게 적어보세요.
        </p>

        <div className="mt-10">
          <label className="font-semibold">오늘의 기록</label>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-3 w-full h-48 rounded-xl border border-gray-300 p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          onClick={handleSave}
          className="mt-8 w-full rounded-xl bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 transition"
        >
          저장
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-600">{message}</p>
        )}
      </div>
    </main>
  );
}