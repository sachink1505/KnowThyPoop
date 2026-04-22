import type { LLMProvider } from "./types";
import { geminiProvider } from "./gemini";
import { openaiProvider } from "./openai";

export function getProvider(): LLMProvider {
  const name = (process.env.LLM_PROVIDER || "gemini").toLowerCase();
  if (name === "openai") return openaiProvider;
  if (name === "gemini") return geminiProvider;
  throw new Error(`Unknown LLM_PROVIDER: ${name}`);
}

export type { LLMProvider, Pass1Result, Pass2Result, EntryContext } from "./types";
