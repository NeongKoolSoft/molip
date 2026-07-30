import type {
  ReflectionState,
} from "@/types/reflectionLoop";

export type ReflectionThoughtPattern = {
  expectation: string | null;
  concern: string | null;
  tension: string | null;

  evidence: string[];
};

export type ReflectionMainThread = {
  target: string;
  reason: string;
  evidence: string[];

  focus: string;
  focusReason: string;

  thoughtPattern: ReflectionThoughtPattern;
};

export type LocalReflectionContext = {
  latestRecord: string;

  mainThread: ReflectionMainThread | null;

  latestFocus: string | null;

  recentEvidence: string[];

  currentState: ReflectionState;

  targetState: ReflectionState;
};

export type GlobalReflectionContext = {
  primaryTarget: string | null;

  immersionTarget: string | null;

  weeklySummary: string | null;
};

export type ReflectionQuestionContextV2 = {
  local: LocalReflectionContext;

  global: GlobalReflectionContext;
};