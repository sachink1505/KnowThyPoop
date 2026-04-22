import type { EntryContext, LLMProvider, Pass1Result, Pass2Result } from "./types";
import { PASS1_PROMPT, buildPass2Prompt } from "./prompts";

const MODEL = "gpt-4o-mini";
const ENDPOINT = "https://api.openai.com/v1/chat/completions";

type OpenAIResponse = {
  choices?: Array<{ message?: { content?: string } }>;
};

async function callOpenAI(
  prompt: string,
  imageBase64: string,
  mimeType: string
): Promise<{ text: string; raw: unknown }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${body}`);
  }

  const raw = (await res.json()) as OpenAIResponse;
  const text = raw.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("OpenAI returned empty response");
  return { text, raw };
}

export const openaiProvider: LLMProvider = {
  async validateImage(imageBase64, mimeType) {
    const { text } = await callOpenAI(PASS1_PROMPT, imageBase64, mimeType);
    return JSON.parse(text) as Pass1Result;
  },

  async analyze(imageBase64, mimeType, context: EntryContext) {
    const prompt = buildPass2Prompt(context);
    const { text, raw } = await callOpenAI(prompt, imageBase64, mimeType);
    const result = JSON.parse(text) as Pass2Result;
    return { result, raw };
  },
};
