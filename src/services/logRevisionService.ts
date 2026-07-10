import { supabase } from "@/lib/supabase";

type SaveRevisionParams = {
  userId: string;
  dailyLogId: string;
  logDate: string;
  content: string;
  source?: "initial" | "manual_edit" | "reflection_edit";
};

export async function saveLogRevision({
  userId,
  dailyLogId,
  logDate,
  content,
  source = "manual_edit",
}: SaveRevisionParams) {
  const trimmed = content.trim();

  // 마지막 Revision 조회
  const { data: lastRevision, error: lastError } = await supabase
    .from("log_revisions")
    .select("revision_number, content")
    .eq("daily_log_id", dailyLogId)
    .order("revision_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastError) {
    throw lastError;
  }

  // 내용이 같으면 저장 안 함
  if (lastRevision?.content === trimmed) {
    return;
  }

  const nextRevision = (lastRevision?.revision_number ?? 0) + 1;

  const { error } = await supabase.from("log_revisions").insert({
    user_id: userId,
    daily_log_id: dailyLogId,
    log_date: logDate,
    content: trimmed,
    revision_number: nextRevision,
    source,
  });

  if (error) {
    throw error;
  }
}