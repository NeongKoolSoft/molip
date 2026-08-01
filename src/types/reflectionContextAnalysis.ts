export type ReflectionContextAnalysis = {
  mainThread: {
    target: string | null;
    reason: string;
    evidence: string[];
  } | null;

  focus: {
    text: string | null;
    reason: string;
    evidence: string[];
  } | null;

  thoughtPattern: {
    expectation: string | null;
    concern: string | null;
    tension: string | null;
    evidence: string[];
  };
};