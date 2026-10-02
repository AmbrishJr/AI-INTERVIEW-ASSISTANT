/**
 * Shared Groq chat-completion settings. Override the model with GROQ_MODEL in .env
 * (list available models: GET https://api.groq.com/openai/v1/models).
 */
export const AI_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

export const AI_COMPLETION_OPTIONS = {
  model: AI_MODEL,
  // gpt-oss models reason before answering; keep it short so max_tokens covers the reply.
  reasoning_effort: "low",
} as const;

/**
 * Parses JSON from a model reply, tolerating ```json fences or prose around the object.
 * Throws if no JSON object can be found, so callers keep their existing fallbacks.
 */
export function parseAIJson<T = any>(reply: string): T {
  const unfenced = reply.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
  try {
    return JSON.parse(unfenced);
  } catch {
    const start = unfenced.indexOf("{");
    const end = unfenced.lastIndexOf("}");
    if (start === -1 || end <= start) throw new SyntaxError("No JSON object in AI reply");
    return JSON.parse(unfenced.slice(start, end + 1));
  }
}
