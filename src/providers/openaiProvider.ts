import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateOpenAIText(
  prompt: string
): Promise<string> {
  const response = await openai.responses.create({
    model: "gpt-5-mini",
    input: prompt,
  });

  return response.output_text;
}