const API_BASE = "http://localhost:8001";

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
