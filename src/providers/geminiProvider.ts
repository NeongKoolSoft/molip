import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
}

const ai = new GoogleGenAI({ apiKey });

const model =
  process.env.GEMINI_MODEL ?? "gemini-3.1-flash-lite-preview";

export async function generateGeminiText(
  prompt: string
): Promise<string> {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  const text = response.text?.trim();

  if (!text) {
    throw new Error("Gemini 응답이 비어 있습니다.");
  }

  return text;
}