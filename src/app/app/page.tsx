"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  User,
} from "@supabase/supabase-js";

import type {
  UserPlan,
} from "@/types/userPlan";

import type {
  DailyLog,
} from "@/types/dailyLog";

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

import {
  loadUserPlan,
} from "@/services/userPlanService";

import {
  deleteTodayAnalysis,
} from "@/services/aiAnalysisService";

import {
  saveLogRevision,
} from "@/services/logRevisionService";

import {
  deleteTodayMeaningGrowthAnalysis,
} from "@/services/meaningGrowthAnalysisService";

import {
  deleteTodayTodaysReflection,
} from "@/services/todaysReflectionAnalysisService";

import {
  supabase,
} from "@/lib/supabase";

import TimelineSection from "@/components/TimelineSection";
import LoginForm from "@/components/LoginForm";
import DailyLogForm from "@/components/DailyLogForm";
import RecentLogs from "@/components/RecentLogs";
import AIInsightCard from "@/components/AIInsightCard";
import ReactionTrendCard from "@/components/ReactionTrendCard";
import ReactionTimelineCard from "@/components/ReactionTimelineCard";
import GrowthSignalCard from "@/components/GrowthSignalCard";
import MeaningGrowthCard from "@/components/MeaningGrowthCard";
import ImmersionDiscoveryV2Card from "@/components/ImmersionDiscoveryV2Card";
import TodaysReflectionCard from "@/components/TodaysReflectionCard";
import WeeklyReportCard from "@/components/WeeklyReportCard";
import ReflectionLoopV3Card from "@/components/ReflectionLoopV3Card";
import ScrollToTopButton from "@/components/ScrollToTopButton";

declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: string,
      parameters?: Record<
        string,
        unknown
      >
    ) => void;
  }
}

function trackGoogleAdsSignup(
  currentUser: User
) {
  console.log(
    "trackGoogleAdsSignup 호출"
  );

  console.log(
    "currentUser",
    currentUser
  );

  console.log(
    "gtag",
    typeof window.gtag
  );

  if (
    typeof window === "undefined" ||
    !window.gtag
  ) {
    return;
  }

  const trackedKey =
    `molip_google_ads_signup_tracked_${currentUser.id}`;

  console.log(
    "trackedKey",
    trackedKey
  );

  console.log(
    "trackedValue",
    window.localStorage.getItem(
      trackedKey
    )
  );

  if (
    window.localStorage.getItem(
      trackedKey
    )
  ) {
    return;
  }

  const createdAt =
    new Date(
      currentUser.created_at
    ).getTime();

  const lastSignInAt =
    currentUser.last_sign_in_at
      ? new Date(
          currentUser.last_sign_in_at
        ).getTime()
      : createdAt;

  const accountAge =
    Date.now() - createdAt;

  const creationLoginGap =
    Math.abs(
      lastSignInAt -
        createdAt
    );

  const isNewSignup =
    accountAge >= 0 &&
    accountAge <
      2 * 60 * 60 * 1000 &&
    creationLoginGap <
      5 * 60 * 1000;

  console.log(
    "isNewSignup",
    isNewSignup
  );

  if (!isNewSignup) {
    return;
  }

  console.log(
    "conversion event 전송"
  );

  window.gtag(
    "event",
    "conversion",
    {
      send_to:
        "AW-17811031025/IBnsCIXd_dgcEPGH-6xC",
    }
  );

  window.localStorage.setItem(
    trackedKey,
    new Date().toISOString()
  );
}

function getLocalDateKey(): string {
  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone:
        "Asia/Seoul",
    }
  ).format(new Date());
}

export default function Home() {
  const [
    user,
    setUser,
  ] =
    useState<User | null>(
      null
    );

  const [
    userPlan,
    setUserPlan,
  ] =
    useState<UserPlan>(
      "free"
    );

  const [
    currentDateKey,
    setCurrentDateKey,
  ] =
    useState(
      () =>
        getLocalDateKey()
    );

  const [
    content,
    setContent,
  ] =
    useState("");

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    logs,
    setLogs,
  ] =
    useState<
      DailyLog[]
    >([]);

  const [
    isInitialContentLoaded,
    setIsInitialContentLoaded,
  ] =
    useState(false);

  const [
    activeReflectionQuestion,
    setActiveReflectionQuestion,
  ] =
    useState<
      string | null
    >(null);

  const [
    analysisVersion,
    setAnalysisVersion,
  ] =
    useState(0);

  const [
    analysisRequestVersion,
    setAnalysisRequestVersion,
  ] =
    useState(0);

  const [
    timelineVersion,
    setTimelineVersion,
  ] =
    useState(0);

  const [
    meaningGrowthVersion,
    setMeaningGrowthVersion,
  ] =
    useState(0);

  const [
    todaysReflectionVersion,
    setTodaysReflectionVersion,
  ] =
    useState(0);

  const [
    weeklyReportVersion,
    setWeeklyReportVersion,
  ] =
    useState(0);

  const [
    reflectionLoopVersion,
    setReflectionLoopVersion,
  ] =
    useState(0);

  const dailyLogFormRef =
    useRef<
      HTMLDivElement | null
    >(null);

  const previousDateKeyRef =
    useRef(
      currentDateKey
    );

  const draftKey =
    useMemo(() => {
      if (!user) {
        return null;
      }

      return `molip_daily_log_draft_${user.id}_${currentDateKey}`;
    }, [
      user,
      currentDateKey,
    ]);

  const applyLoadedDailyData = (
    userId: string,
    todayContent: string,
    recentLogs: DailyLog[],
    dateKey: string
  ) => {
    const currentDraftKey =
      `molip_daily_log_draft_${userId}_${dateKey}`;

    const savedDraft =
      window.localStorage.getItem(
        currentDraftKey
      );

    if (
      todayContent.trim()
    ) {
      setContent(
        todayContent
      );
    } else if (
      savedDraft !== null
    ) {
      setContent(
        savedDraft
      );
    } else {
      setContent("");
    }

    setLogs(
      recentLogs
    );

    setIsInitialContentLoaded(
      true
    );
  };

  const refreshLogs =
    async (
      userId: string,
      dateKey =
        getLocalDateKey()
    ) => {
      const [
        todayContent,
        recentLogs,
      ] =
        await Promise.all([
          loadTodayLog(
            userId
          ),
          loadRecentLogs(
            userId
          ),
        ]);

      applyLoadedDailyData(
        userId,
        todayContent,
        recentLogs,
        dateKey
      );
    };

  useEffect(() => {
    let isMounted = true;

    const applyUser =
      async (
        currentUser:
          User | null
      ) => {
        if (!isMounted) {
          return;
        }

        setUser(
          currentUser
        );

        setIsInitialContentLoaded(
          false
        );

        setActiveReflectionQuestion(
          null
        );

        if (!currentUser) {
          setUserPlan(
            "free"
          );

          setContent("");
          setLogs([]);

          return;
        }

        trackGoogleAdsSignup(
          currentUser
        );

        const latestDateKey =
          getLocalDateKey();

        setCurrentDateKey(
          latestDateKey
        );

        previousDateKeyRef.current =
          latestDateKey;

        const [
          todayContent,
          recentLogs,
          plan,
        ] =
          await Promise.all([
            loadTodayLog(
              currentUser.id
            ),

            loadRecentLogs(
              currentUser.id
            ),

            loadUserPlan(
              currentUser.id
            ),
          ]);

        if (!isMounted) {
          return;
        }

        setUserPlan(
          plan
        );

        applyLoadedDailyData(
          currentUser.id,
          todayContent,
          recentLogs,
          latestDateKey
        );
      };

    const loadInitialUser =
      async () => {
        try {
          const currentUser =
            await getCurrentUser();

          await applyUser(
            currentUser
          );
        } catch (error) {
          console.error(
            "초기 로그인 상태 확인 실패:",
            error
          );
        }
      };

    void loadInitialUser();

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (
          _event,
          session
        ) => {
          window.setTimeout(
            () => {
              applyUser(
                session?.user ??
                  null
              ).catch(
                (
                  error
                ) => {
                  console.error(
                    "로그인 상태 반영 실패:",
                    error
                  );
                }
              );
            },
            0
          );
        }
      );

    return () => {
      isMounted = false;

      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const checkDateChange =
      () => {
        const nextDateKey =
          getLocalDateKey();

        setCurrentDateKey(
          (
            previousDateKey
          ) =>
            previousDateKey ===
            nextDateKey
              ? previousDateKey
              : nextDateKey
        );
      };

    const handleVisibilityChange =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          checkDateChange();
        }
      };

    const intervalId =
      window.setInterval(
        checkDateChange,
        60 * 1000
      );

    window.addEventListener(
      "focus",
      checkDateChange
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    checkDateChange();

    return () => {
      window.clearInterval(
        intervalId
      );

      window.removeEventListener(
        "focus",
        checkDateChange
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  useEffect(() => {
    if (!user) {
      previousDateKeyRef.current =
        currentDateKey;

      return;
    }

    const previousDateKey =
      previousDateKeyRef.current;

    if (
      previousDateKey ===
      currentDateKey
    ) {
      return;
    }

    previousDateKeyRef.current =
      currentDateKey;

    let isMounted = true;

    const reloadForNewDate =
      async () => {
        try {
          setMessage("");

          setActiveReflectionQuestion(
            null
          );

          setIsInitialContentLoaded(
            false
          );

          const [
            todayContent,
            recentLogs,
          ] =
            await Promise.all([
              loadTodayLog(
                user.id
              ),

              loadRecentLogs(
                user.id
              ),
            ]);

          if (!isMounted) {
            return;
          }

          applyLoadedDailyData(
            user.id,
            todayContent,
            recentLogs,
            currentDateKey
          );

          setAnalysisVersion(
            (
              previous
            ) =>
              previous + 1
          );

          setAnalysisRequestVersion(
            (
              previous
            ) =>
              previous + 1
          );

          setReflectionLoopVersion(
            (
              previous
            ) =>
              previous + 1
          );

          setMeaningGrowthVersion(
            (
              previous
            ) =>
              previous + 1
          );

          setTodaysReflectionVersion(
            (
              previous
            ) =>
              previous + 1
          );

          setWeeklyReportVersion(
            (
              previous
            ) =>
              previous + 1
          );

          setTimelineVersion(
            (
              previous
            ) =>
              previous + 1
          );
        } catch (error) {
          console.error(
            "날짜 변경 후 데이터 재조회 실패:",
            error
          );

          if (
            isMounted
          ) {
            setIsInitialContentLoaded(
              true
            );
          }
        }
      };

    void reloadForNewDate();

    return () => {
      isMounted = false;
    };
  }, [
    user,
    currentDateKey,
  ]);

  useEffect(() => {
    if (
      !draftKey ||
      !isInitialContentLoaded
    ) {
      return;
    }

    if (
      content.trim()
    ) {
      window.localStorage.setItem(
        draftKey,
        content
      );

      return;
    }

    window.localStorage.removeItem(
      draftKey
    );
  }, [
    content,
    draftKey,
    isInitialContentLoaded,
  ]);

  const handleGoogleLogin =
    async () => {
      setMessage("");

      try {
        await login();
      } catch (error) {
        console.error(
          error
        );

        setMessage(
          "Google 로그인 중 오류가 발생했습니다."
        );
      }
    };

  const handleLogout =
    async () => {
      try {
        await logout();

        setUser(null);

        setUserPlan(
          "free"
        );

        setContent("");
        setLogs([]);

        setMessage(
          "로그아웃되었습니다."
        );

        setActiveReflectionQuestion(
          null
        );

        setIsInitialContentLoaded(
          false
        );
      } catch (error) {
        console.error(
          error
        );

        setMessage(
          "로그아웃 중 오류가 발생했습니다."
        );
      }
    };

  const handleContinueReflection =
    (
      question: string
    ) => {
      setActiveReflectionQuestion(
        question
      );

      setMessage(
        "질문을 보며 떠오른 생각을 오늘 기록에 덧붙여 보세요."
      );

      window.requestAnimationFrame(
        () => {
          dailyLogFormRef.current
            ?.scrollIntoView({
              behavior:
                "smooth",
              block:
                "start",
            });

          window.setTimeout(
            () => {
              const input =
                dailyLogFormRef.current
                  ?.querySelector<
                    HTMLTextAreaElement
                  >(
                    "textarea"
                  );

              input?.focus();

              if (!input) {
                return;
              }

              const cursorPosition =
                input.value.length;

              input.setSelectionRange(
                cursorPosition,
                cursorPosition
              );
            },
            500
          );
        }
      );
    };

  const handleSave =
    async () => {
      setMessage("");

      if (!user) {
        setMessage(
          "로그인이 필요합니다."
        );

        return;
      }

      const latestDateKey =
        getLocalDateKey();

      if (
        latestDateKey !==
        currentDateKey
      ) {
        setCurrentDateKey(
          latestDateKey
        );

        setMessage(
          "날짜가 변경되었습니다. 오늘 기록을 다시 확인한 뒤 저장해 주세요."
        );

        return;
      }

      const trimmedContent =
        content.trim();

      if (!trimmedContent) {
        setMessage(
          "기록을 입력해 주세요."
        );

        return;
      }

      try {
        const previousLog =
          await loadTodayLogRow(
            user.id
          );

        if (
          previousLog?.content.trim() ===
          trimmedContent
        ) {
          setMessage(
            "변경된 내용이 없습니다."
          );

          return;
        }

        const savedLog =
          await saveTodayLog(
            user.id,
            trimmedContent
          );

        if (!previousLog) {
          await saveLogRevision({
            userId:
              user.id,

            dailyLogId:
              savedLog.id,

            logDate:
              savedLog.log_date,

            content:
              savedLog.content,

            source:
              "initial",
          });
        } else {
          await saveLogRevision({
            userId:
              user.id,

            dailyLogId:
              previousLog.id,

            logDate:
              previousLog.log_date,

            content:
              previousLog.content,

            source:
              "initial",
          });

          await saveLogRevision({
            userId:
              user.id,

            dailyLogId:
              savedLog.id,

            logDate:
              savedLog.log_date,

            content:
              savedLog.content,

            source:
              "manual_edit",
          });
        }

        await deleteTodayAnalysis(
          user.id
        );

        await deleteTodayMeaningGrowthAnalysis(
          user.id
        );

        await deleteTodayTodaysReflection(
          user.id
        );

        setIsInitialContentLoaded(
          false
        );

        if (draftKey) {
          window.localStorage.removeItem(
            draftKey
          );
        }

        await refreshLogs(
          user.id,
          currentDateKey
        );

        setAnalysisVersion(
          (
            previous
          ) =>
            previous + 1
        );

        setAnalysisRequestVersion(
          (
            previous
          ) =>
            previous + 1
        );

        setActiveReflectionQuestion(
          null
        );

        setMessage(
          previousLog
            ? "✅ 수정된 기록이 저장되었습니다.\nAI가 기록의 변화를 살펴보고 있습니다."
            : "✅ 오늘의 기록이 저장되었습니다.\nAI가 기록의 변화를 살펴보고 있습니다."
        );
      } catch (error) {
        console.error(
          error
        );

        setMessage(
          "저장 중 오류가 발생했습니다."
        );
      }
    };

  if (!user) {
    return (
      <LoginForm
        message={
          message
        }
        onGoogleLogin={
          handleGoogleLogin
        }
      />
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-xl rounded-2xl bg-white p-5 shadow-lg sm:p-8">
        <div
          ref={
            dailyLogFormRef
          }
          className="scroll-mt-6"
        >
          {activeReflectionQuestion && (
            <div className="mb-5 rounded-2xl border-2 border-violet-300 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-600 text-lg shadow-sm">
                  🤔
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-bold text-violet-700">
                    질문에 답하며
                    기록을 이어보세요
                  </p>

                  <p className="mt-3 break-keep text-base font-bold leading-7 text-gray-950">
                    {
                      activeReflectionQuestion
                    }
                  </p>

                  <p className="mt-3 break-keep text-sm leading-6 text-gray-600">
                    기존 기록의 마지막에
                    떠오른 생각을 덧붙인 후
                    저장해 주세요.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DailyLogForm
            content={
              content
            }
            message={
              message
            }
            onContentChange={
              setContent
            }
            onSave={
              handleSave
            }
            onLogout={
              handleLogout
            }
          />
        </div>

        <RecentLogs
          logs={
            logs
          }
        />

        <section className="mt-10">
          <div className="mb-5">
            <p className="text-sm font-semibold text-indigo-600">
              오늘
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              오늘의 기록과 생각
            </h2>

            <p className="mt-2 break-keep text-sm leading-6 text-slate-600">
              오늘 기록을 남기고,
              AI가 읽은 흐름을 확인한
              뒤 생각을 한 번 더
              이어갑니다.
            </p>
          </div>

          <AIInsightCard
            userId={
              user.id
            }
            logs={
              logs
            }
            refreshKey={
              analysisVersion
            }
            analysisRequestKey={
              analysisRequestVersion
            }
            onAnalysisComplete={() => {
              setTimelineVersion(
                (
                  previous
                ) =>
                  previous + 1
              );

              setWeeklyReportVersion(
                (
                  previous
                ) =>
                  previous + 1
              );

              setReflectionLoopVersion(
                (
                  previous
                ) =>
                  previous + 1
              );
            }}
            onMeaningGrowthComplete={() =>
              setMeaningGrowthVersion(
                (
                  previous
                ) =>
                  previous + 1
              )
            }
            onTodaysReflectionComplete={() =>
              setTodaysReflectionVersion(
                (
                  previous
                ) =>
                  previous + 1
              )
            }
          />

          <ReflectionLoopV3Card
            userId={
              user.id
            }
            refreshKey={
              reflectionLoopVersion
            }
            onContinueReflection={
              handleContinueReflection
            }
          />

          <TodaysReflectionCard
            userId={
              user.id
            }
            refreshKey={
              todaysReflectionVersion
            }
          />
        </section>

        <TimelineSection
          icon="🔍"
          title="발견"
          description="기록에서 반복해서 나타난 반응과 몰입 가능성을 살펴봅니다."
        >
          <GrowthSignalCard
            userId={
              user.id
            }
            refreshKey={
              analysisVersion
            }
          />

          <MeaningGrowthCard
            userId={
              user.id
            }
            refreshKey={
              meaningGrowthVersion
            }
          />

          <ImmersionDiscoveryV2Card
            userId={
              user.id
            }
            refreshKey={
              analysisVersion
            }
          />
        </TimelineSection>

        <TimelineSection
          icon="📅"
          title="지난 7일"
          description="여러 날의 기록을 연결해 이번 주에 이어진 흐름을 돌아봅니다."
          badge="Plus"
        >
          <WeeklyReportCard
            userId={
              user.id
            }
            plan={
              userPlan
            }
            refreshKey={
              weeklyReportVersion
            }
          />
        </TimelineSection>

        <TimelineSection
          icon="🌱"
          title="시간 속 변화"
          description="시간이 지나며 반복된 반응과 변화의 방향을 연결해 살펴봅니다."
          badge="Plus"
        >
          <ReactionTrendCard
            userId={
              user.id
            }
            plan={
              userPlan
            }
            refreshKey={
              timelineVersion
            }
          />

          <ReactionTimelineCard
            userId={
              user.id
            }
            plan={
              userPlan
            }
            refreshKey={
              timelineVersion
            }
          />
        </TimelineSection>

        <ScrollToTopButton />
      </div>
    </main>
  );
}