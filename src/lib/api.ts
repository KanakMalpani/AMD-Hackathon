import type { PromptData, SimulationReport } from "@/lib/app-store";

const DEFAULT_API_BASE = "http://localhost:8001";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function getApiBase(): string {
  const envBase = import.meta.env.VITE_API_BASE_URL?.trim();
  if (envBase) return trimTrailingSlash(envBase);
  return DEFAULT_API_BASE;
}

const API_BASE = getApiBase();

export type GenerateStartupResponse = {
  job_id: string;
  message: string;
  runtime?: {
    mock_mode: boolean;
    model: string;
    base_url: string;
  };
};

export type JobStatusResponse = {
  status: string;
  output?: string;
  report?: SimulationReport;
  error?: string;
};

export async function generateStartup(data: PromptData): Promise<GenerateStartupResponse> {
  const res = await fetch(`${API_BASE}/generate-startup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to start simulation");
  return res.json();
}

export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  const res = await fetch(`${API_BASE}/status/${jobId}`);
  if (!res.ok) throw new Error("Failed to fetch status");
  return res.json();
}
