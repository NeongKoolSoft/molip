import { supabase } from "@/lib/supabase";

import type {
  ReflectionQuestionResult,
} from "@/types/reflectionLoop";

import type {
  ReflectionQuestionContextV2,
} from "@/types/reflectionContext";

export async function generateReflectionQuestion(
  context: ReflectionQuestionContextV2
): Promise<ReflectionQuestionResult> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (!session?.access_token) {
    throw new Error("로그인 정보가 없습니다.");
  }

  const response = await fetch("/api/reflection-question", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      context,
    }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error(
      "Reflection Question API 상태:",
      response.status
    );
    console.error(
      "Reflection Question API 원문:",
      responseText
    );

    let errorMessage =
      `Reflection Question API 오류 (${response.status})`;

    try {
      const errorBody = JSON.parse(responseText);

      errorMessage =
        errorBody.detail ??
        errorBody.error ??
        errorMessage;
    } catch {
      // HTML 오류 응답일 수 있다.
    }

    throw new Error(errorMessage);
  }

  try {
    return JSON.parse(
      responseText
    ) as ReflectionQuestionResult;
  } catch {
    console.error(
      "Reflection Question 응답이 JSON이 아닙니다:",
      responseText
    );

    throw new Error(
      "Reflection Question 응답 형식이 올바르지 않습니다."
    );
  }
}