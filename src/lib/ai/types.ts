export interface AiCallLog {
  event: "ai.call";
  status: "ok" | "error" | "disabled";
  model: string;
  promptId: string;
  promptVersion: string;
  inputTokens: number | null;
  outputTokens: number | null;
  latencyMs: number;
  costEstimateUsd: number | null;
  retried: boolean;
  error?: { name: string; status?: number; message: string };
}

export interface Logger {
  info: (log: AiCallLog) => void;
}
