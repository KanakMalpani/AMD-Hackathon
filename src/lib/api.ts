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

export async function generateStartup(idea: string): Promise<string> {
  const res = await fetch(`${API_BASE}/generate-startup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea }),
  });
  if (!res.ok) throw new Error("Failed to start generation");
  const data = await res.json();
  return data.job_id;
}

export async function getJobStatus(jobId: string): Promise<{ status: string; output?: string; error?: string }> {
  const res = await fetch(`${API_BASE}/status/${jobId}`);
  if (!res.ok) throw new Error("Failed to fetch status");
  return res.json();
}
