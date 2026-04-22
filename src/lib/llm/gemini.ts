import type { EntryContext, LLMProvider, Pass1Result, Pass2Result } from "./types";
import { PASS1_PROMPT, buildPass2Prompt } from "./prompts";

const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
};

async function callGemini(
  prompt: string,
  imageBase64: string,
  mimeType: string
): Promise<{ text: string; raw: unknown }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType, data: imageBase64 } },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: "application/json",
        temperature: 0.2,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini error ${res.status}: ${body}`);
  }

  const raw = (await res.json()) as GeminiResponse;
  const text = raw.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!text) throw new Error("Gemini returned empty response");
  return { text, raw };
}

export const geminiProvider: LLMProvider = {
  async validateImage(imageBase64, mimeType) {
    const { text } = await callGemini(PASS1_PROMPT, imageBase64, mimeType);
    const parsed = JSON.parse(text) as Pass1Result;
    return parsed;
  },

  async analyze(imageBase64, mimeType, context: EntryContext) {
    const prompt = buildPass2Prompt(context);
    const { text, raw } = await callGemini(prompt, imageBase64, mimeType);
    const result = JSON.parse(text) as Pass2Result;
    return { result, raw };
  },
};
