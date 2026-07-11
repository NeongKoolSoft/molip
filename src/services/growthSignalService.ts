import { supabase } from "@/lib/supabase";
import type {
  GrowthSignal,
  LogRevision,
} from "@/types/growthSignal";

const countSentences = (content: string) => {
  const normalized = content.trim();

  if (!normalized) {
    return 0;
  }

  return normalized
    .split(/(?<=[.!?。！？])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean).length;
};

const createSummary = ({
  revisionCount,
  lengthChange,
  sentenceChange,
}: {
  revisionCount: number;
  lengthChange: number;
  sentenceChange: number;
}) => {
  if (revisionCount <= 1) {
    return "아직 비교할 수정 기록이 충분하지 않습니다.";
  }

  if (lengthChange > 0 && sentenceChange > 0) {
    return "기록을 다시 돌아보며 생각이 더 구체적으로 확장된 흔적이 있습니다.";
  }

  if (lengthChange > 0) {
    return "기록을 수정하면서 생각을 조금 더 자세히 표현한 흔적이 있습니다.";
  }

  if (lengthChange < 0) {
    return "기록을 수정하면서 생각을 더 간결하게 정리한 흔적이 있습니다.";
  }

  return "기록의 길이는 비슷하지만 표현을 다시 다듬은 흔적이 있습니다.";
};

export async function loadTodayGrowthSignal(
  userId: string
): Promise<GrowthSignal | null> {
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("log_revisions")
    .select(
      `
        id,
        daily_log_id,
        log_date,
        content,
        revision_number,
        source,
        created_at
      `
    )
    .eq("user_id", userId)
    .eq("log_date", today)
    .order("revision_number", { ascending: true });

  if (error) {
    throw error;
  }

  const revisions = (data ?? []) as LogRevision[];

  if (revisions.length === 0) {
    return null;
  }

  const initial = revisions[0];
  const latest = revisions[revisions.length - 1];

  const initialLength = initial.content.trim().length;
  const latestLength = latest.content.trim().length;
  const lengthChange = latestLength - initialLength;

  const lengthChangeRate =
    initialLength > 0
      ? Math.round((lengthChange / initialLength) * 100)
      : 0;

  const initialSentenceCount = countSentences(initial.content);
  const latestSentenceCount = countSentences(latest.content);
  const sentenceChange =
    latestSentenceCount - initialSentenceCount;

  const revisionCount = revisions.length;
  const editCount = Math.max(0, revisionCount - 1);

  return {
    revisionCount,
    editCount,

    initialLength,
    latestLength,
    lengthChange,
    lengthChangeRate,

    initialSentenceCount,
    latestSentenceCount,
    sentenceChange,

    hasExpanded: lengthChange > 0 || sentenceChange > 0,

    summary: createSummary({
      revisionCount,
      lengthChange,
      sentenceChange,
    }),
  };
}