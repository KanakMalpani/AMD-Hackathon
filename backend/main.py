import concurrent.futures
import html
import json
import os
import re
import threading
import time
import uuid
from copy import deepcopy
from statistics import mean
from typing import Any
from urllib.parse import parse_qs, quote_plus, unquote, urlparse

import requests
from fastapi import BackgroundTasks, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


app = FastAPI(title="LaunchMyIdea AI API")


DEFAULT_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "http://localhost:4174",
    "http://127.0.0.1:4174",
    "http://localhost:4175",
    "http://127.0.0.1:4175",
    "https://amd-hackathon-beta.vercel.app",
]


def parse_cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "")
    if not raw.strip():
        return DEFAULT_CORS_ORIGINS
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


app.add_middleware(
    CORSMiddleware,
    allow_origins=parse_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


USE_MOCK = os.getenv("USE_MOCK", "true").lower() in {"1", "true", "yes"}
MODEL_API_BASE_URL = os.getenv(
    "MODEL_API_BASE_URL",
    os.getenv(
        "OPENROUTER_BASE_URL",
        os.getenv("GROQ_API_BASE_URL", os.getenv("AMD_LLM_BASE_URL", "https://openrouter.ai/api/v1")),
    ),
)
MODEL_API_MODEL = (
    os.getenv("MODEL_API_MODEL")
    or os.getenv("OPENROUTER_MODEL")
    or os.getenv("GROQ_MODEL")
    or (
        "llama-3.1-8b-instant"
        if (
            os.getenv("GROQ_API_KEY")
            or "groq" in os.getenv("MODEL_API_BASE_URL", "").lower()
            or "groq" in os.getenv("GROQ_API_BASE_URL", "").lower()
        )
        else os.getenv("AMD_LLM_MODEL", "openrouter/auto")
    )
)
MODEL_API_KEY = os.getenv(
    "MODEL_API_KEY",
    os.getenv("OPENROUTER_API_KEY", os.getenv("GROQ_API_KEY", os.getenv("AMD_LLM_API_KEY", "dummy"))),
)
MODEL_API_TEMPERATURE = float(
    os.getenv(
        "MODEL_API_TEMPERATURE",
        os.getenv("OPENROUTER_TEMPERATURE", os.getenv("AMD_LLM_TEMPERATURE", "0.25")),
    )
)
MODEL_API_TIMEOUT_SECONDS = int(os.getenv("MODEL_API_TIMEOUT_SECONDS", "90"))


def detect_provider(base_url: str, model: str) -> str:
    source = f"{base_url} {model}".lower()
    if "openrouter" in source:
        return "openrouter"
    if "groq" in source:
        return "groq"
    if "localhost" in source or "127.0.0.1" in source or "amd" in source:
        return "amd-compatible"
    return "openai-compatible"


STAGE_TEMPLATE = [
    {
        "key": "seed",
        "title": "Reality Seed",
        "description": "Startup premise and live market signals locked",
    },
    {
        "key": "strategy",
        "title": "CEO Strategy",
        "description": "Thesis, wedge, and mission drafted",
    },
    {
        "key": "world",
        "title": "World Model",
        "description": "Market forces and simulation modes assembled",
    },
    {
        "key": "agents",
        "title": "Agent Cast",
        "description": "Specialist personas and responsibilities generated",
    },
    {
        "key": "build",
        "title": "Build Plan",
        "description": "MVP stack, flow, and preview scaffold designed",
    },
    {
        "key": "launch",
        "title": "Launch Motion",
        "description": "Narrative, channels, and GTM hooks generated",
    },
    {
        "key": "finance",
        "title": "Revenue Model",
        "description": "Pricing, cost logic, and viability evaluated",
    },
    {
        "key": "critic",
        "title": "Critic Loop",
        "description": "Weak assumptions attacked and improved",
    },
    {
        "key": "report",
        "title": "AMD Report",
        "description": "Final startup-world report published",
    },
]
SCORE_KEYS = ("problem", "market", "mvp", "differentiation", "revenue", "execution")


class StartupRequest(BaseModel):
    idea: str
    audience: str | None = ""
    problem: str | None = ""
    businessModel: str | None = ""
    mvpScope: str | None = ""
    tone: str | None = ""
    constraints: str | None = ""
    seedContext: str | None = ""
    keySignals: str | None = ""
    simulationGoal: str | None = ""
    amdFocus: str | None = ""


jobs: dict[str, dict[str, Any]] = {}
jobs_lock = threading.Lock()


def fresh_stages() -> list[dict[str, str]]:
    return [{**stage, "status": "pending"} for stage in STAGE_TEMPLATE]


def classify_idea(idea: str) -> dict[str, str]:
    text = idea.lower()
    if any(token in text for token in ["student", "study", "exam", "campus", "learning"]):
        return {
            "category": "student",
            "segment": "students, campus builders, and education-focused founders",
            "differentiator": "turning chaotic academic pressure into a visible execution system",
            "headline": "Simulate a better path from study stress to daily execution",
        }
    if any(token in text for token in ["fitness", "workout", "gym", "diet", "health"]):
        return {
            "category": "fitness",
            "segment": "fitness newcomers and accountability-driven habit builders",
            "differentiator": "making motivation measurable through visible coaching loops",
            "headline": "Simulate the habit system before shipping the product",
        }
    if any(token in text for token in ["creator", "content", "youtube", "instagram", "tiktok", "newsletter"]):
        return {
            "category": "creator",
            "segment": "solo creators trying to maintain consistency without burning out",
            "differentiator": "compressing ideation, packaging, and distribution into one loop",
            "headline": "Simulate creator momentum before the content calendar slips",
        }
    if any(token in text for token in ["solar", "energy", "battery", "climate", "sustainable"]):
        return {
            "category": "climate",
            "segment": "operations-heavy founders exploring climate and sustainability products",
            "differentiator": "connecting operational savings with a stronger environmental story",
            "headline": "Simulate climate utility before hardware spend compounds",
        }
    return {
        "category": "general",
        "segment": "founders exploring a fresh startup wedge under uncertainty",
        "differentiator": "showing the startup as a living system instead of a static plan",
        "headline": "Build the startup mirror world before burning real-world time",
    }


def base_prompt_fields(request: StartupRequest) -> dict[str, str]:
    profile = classify_idea(request.idea)
    return {
        "idea": request.idea.strip() or "Autonomous founder assistant",
        "audience": request.audience.strip() or profile["segment"],
        "problem": request.problem.strip() or "Founders move from inspiration to execution too slowly.",
        "business_model": request.businessModel.strip() or "Usage-based premium workspace with team tier.",
        "mvp_scope": request.mvpScope.strip()
        or "Simulation brief, multi-agent run, preview page, and launch report.",
        "tone": request.tone.strip() or "Bold, cinematic, technically credible",
        "constraints": request.constraints.strip()
        or "Preserve AMD branding, ship reliably on the web, and stay hackathon-demo friendly.",
        "seed_context": request.seedContext.strip()
        or "No extra dossier supplied. Use the idea itself as the reality seed.",
        "key_signals": request.keySignals.strip()
        or "AI-native workflows, shrinking startup cycles, higher founder expectations.",
        "simulation_goal": request.simulationGoal.strip()
        or "Pressure-test whether the startup can earn attention, retention, and revenue.",
        "amd_focus": request.amdFocus.strip()
        or "Use AMD GPUs for low-latency inference, visible concurrency, and demo impact.",
        "category": profile["category"],
        "headline": profile["headline"],
        "differentiator": profile["differentiator"],
    }


def agent_roster() -> list[dict[str, str]]:
    return [
        {
            "name": "CEO Agent",
            "role": "Strategic Leader",
            "goal": "Frame the startup thesis, task graph, and execution priorities.",
            "style": "Decisive, macro, founder-grade.",
            "deliverable": "Company direction, positioning, and success criteria.",
        },
        {
            "name": "Product Agent",
            "role": "Product Architect",
            "goal": "Define the MVP, user journey, and experience wedge.",
            "style": "Structured, user-obsessed, ruthless on scope.",
            "deliverable": "MVP plan, flows, and feature sequencing.",
        },
        {
            "name": "Engineer Agent",
            "role": "Systems Builder",
            "goal": "Design implementation architecture and a compelling interactive preview.",
            "style": "Pragmatic, technical, performance-aware.",
            "deliverable": "Tech stack, system design, and preview HTML.",
        },
        {
            "name": "Marketing Agent",
            "role": "Growth Strategist",
            "goal": "Craft narrative, channels, and launch motion.",
            "style": "Sharp, audience-aware, campaign-minded.",
            "deliverable": "Launch messaging, channels, and outreach.",
        },
        {
            "name": "Finance Agent",
            "role": "Business Analyst",
            "goal": "Pressure-test cost, revenue, and pricing assumptions.",
            "style": "Analytical, skeptical, model-driven.",
            "deliverable": "Revenue projection, costs, and monetization logic.",
        },
        {
            "name": "Critic Agent",
            "role": "World Challenger",
            "goal": "Attack the plan before the market does.",
            "style": "Blunt, adversarial, quality-first.",
            "deliverable": "Failure modes, risks, and iteration path.",
        },
    ]


def update_job(job_id: str, **patch: Any) -> None:
    with jobs_lock:
        if job_id in jobs:
            jobs[job_id].update(patch)


def read_job(job_id: str) -> dict[str, Any]:
    with jobs_lock:
        if job_id not in jobs:
            return {"status": "not found"}
        return deepcopy(jobs[job_id])


def append_activity(job_id: str, agent: str, text: str, done: bool = False) -> None:
    with jobs_lock:
        job = jobs[job_id]
        job["activity"].append(
            {
                "id": f"{job_id}_{len(job['activity']) + 1}",
                "agent": agent,
                "text": text,
                "ts": time.strftime("%H:%M:%S"),
                "done": done,
            }
        )


def set_stage_state(job_id: str, stage_key: str, status: str) -> None:
    with jobs_lock:
        job = jobs[job_id]
        for stage in job["stages"]:
            if status == "running" and stage["status"] == "running":
                stage["status"] = "complete"
            if stage["key"] == stage_key:
                stage["status"] = status
                break


def set_progress(job_id: str, readiness: int) -> None:
    with jobs_lock:
        jobs[job_id]["readiness"] = readiness


def parse_json_content(content: str) -> dict[str, Any]:
    text = content.strip()
    if text.startswith("```"):
        parts = text.split("```")
        text = parts[1] if len(parts) > 1 else text
        text = text.replace("json", "", 1).strip()
    if "{" in text and "}" in text:
        text = text[text.find("{") : text.rfind("}") + 1]
    return json.loads(text)


def chat_completions_url() -> str:
    return MODEL_API_BASE_URL.rstrip("/") + "/chat/completions"


def model_headers() -> dict[str, str]:
    headers = {
        "Authorization": f"Bearer {MODEL_API_KEY}",
        "Content-Type": "application/json",
    }
    if detect_provider(MODEL_API_BASE_URL, MODEL_API_MODEL) == "openrouter":
        headers["HTTP-Referer"] = "https://amd-hackathon-beta.vercel.app"
        headers["X-Title"] = "LaunchMyIdea AI"
    return headers


def clamp(value: int, floor: int = 40, ceiling: int = 96) -> int:
    return max(floor, min(ceiling, int(value)))


def idea_fingerprint(text: str) -> int:
    total = 0
    for index, char in enumerate(text.lower()):
        total += (index + 1) * ord(char)
    return total


def seeded_score(seed: int, salt: int, low: int, high: int) -> int:
    span = high - low + 1
    return low + ((seed + salt * 37) % span)


def format_users(value: int) -> str:
    if value >= 1000:
        rounded = round(value / 1000, 1)
        return f"{rounded:g}K"
    return str(value)


def dedupe_strings(items: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for item in items:
        normalized = item.strip()
        if normalized and normalized not in seen:
            seen.add(normalized)
            result.append(normalized)
    return result


def merge_sources(primary: list[dict[str, str]], secondary: list[dict[str, str]]) -> list[dict[str, str]]:
    merged: list[dict[str, str]] = []
    seen: set[str] = set()
    for source in primary + secondary:
        url = (source.get("url") or "").strip()
        title = (source.get("title") or "").strip()
        note = (source.get("note") or source.get("snippet") or "").strip()
        key = url or title
        if not key or key in seen:
            continue
        seen.add(key)
        merged.append({"title": title or url, "url": url, "note": note})
    return merged[:8]


def strip_tags(value: str) -> str:
    return " ".join(html.unescape(re.sub(r"<[^>]+>", " ", value)).split())


def normalize_result_url(url: str) -> str:
    candidate = html.unescape(url).strip()
    if "duckduckgo.com/l/" in candidate:
        parsed = urlparse(candidate)
        redirected = parse_qs(parsed.query).get("uddg", [])
        if redirected:
            return unquote(redirected[0])
    return candidate


def fetch_search_results(query: str, max_results: int = 4) -> list[dict[str, str]]:
    response = requests.get(
        f"https://html.duckduckgo.com/html/?q={quote_plus(query)}",
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            )
        },
        timeout=20,
    )
    response.raise_for_status()
    body = response.text
    title_matches = list(
        re.finditer(
            r'<a[^>]*class="result__a"[^>]*href="(?P<url>[^"]+)"[^>]*>(?P<title>.*?)</a>',
            body,
            flags=re.IGNORECASE | re.DOTALL,
        )
    )
    snippet_matches = [
        strip_tags(match.group("snippet"))
        for match in re.finditer(
            r'<(?:a|div)[^>]*class="result__snippet"[^>]*>(?P<snippet>.*?)</(?:a|div)>',
            body,
            flags=re.IGNORECASE | re.DOTALL,
        )
    ]
    results: list[dict[str, str]] = []
    for index, match in enumerate(title_matches[:max_results]):
        url = normalize_result_url(match.group("url"))
        title = strip_tags(match.group("title"))
        snippet = snippet_matches[index] if index < len(snippet_matches) else ""
        if not url or not title:
            continue
        results.append({"title": title, "url": url, "note": snippet})
    return results


def build_search_context(payload: dict[str, str]) -> tuple[str, list[dict[str, str]]]:
    queries = [
        payload["idea"],
        f"{payload['idea']} competitors market demand",
        f"{payload['idea']} pricing customers startup",
    ]
    gathered: list[dict[str, str]] = []
    for query in queries:
        try:
            gathered.extend(fetch_search_results(query, max_results=3))
        except Exception:
            continue
    sources = merge_sources(gathered, [])
    lines = []
    for source in sources[:6]:
        line = source["title"]
        if source.get("note"):
            line += f": {source['note']}"
        if source.get("url"):
            line += f" ({source['url']})"
        lines.append(line)
    return "\n".join(lines), sources


def extract_sources_from_annotations(message: dict[str, Any]) -> list[dict[str, str]]:
    annotations = message.get("annotations") or []
    sources: list[dict[str, str]] = []
    for annotation in annotations:
        if annotation.get("type") != "url_citation":
            continue
        citation = annotation.get("url_citation") or {}
        sources.append(
            {
                "title": str(citation.get("title") or citation.get("url") or "").strip(),
                "url": str(citation.get("url") or "").strip(),
                "note": str(citation.get("content") or "").strip(),
            }
        )
    return [source for source in sources if source["url"]]


def extract_sources_from_tool_calls(message: dict[str, Any]) -> list[dict[str, str]]:
    sources: list[dict[str, str]] = []
    for tool_call in message.get("tool_calls") or []:
        if tool_call.get("type") != "browser_search":
            continue
        search_result = tool_call.get("search_result") or {}
        for result in search_result.get("results") or []:
            sources.append(
                {
                    "title": str(result.get("title") or result.get("url") or "").strip(),
                    "url": str(result.get("url") or "").strip(),
                    "note": str(result.get("snippet") or result.get("content") or "").strip(),
                }
            )
    return [source for source in sources if source["url"]]


def invoke_model_text(
    messages: list[dict[str, str]],
    *,
    model: str | None = None,
    tools: list[dict[str, Any]] | None = None,
    tool_choice: str | None = None,
) -> tuple[str, list[dict[str, str]]]:
    payload: dict[str, Any] = {
        "model": model or MODEL_API_MODEL,
        "messages": messages,
        "temperature": max(MODEL_API_TEMPERATURE, 1e-8),
    }
    if tools:
        payload["tools"] = tools
    if tool_choice:
        payload["tool_choice"] = tool_choice

    response = requests.post(
        chat_completions_url(),
        headers=model_headers(),
        json=payload,
        timeout=MODEL_API_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    body = response.json()
    message = body["choices"][0]["message"]
    content = message.get("content", "")
    text = content if isinstance(content, str) else json.dumps(content)
    sources = merge_sources(
        extract_sources_from_annotations(message),
        extract_sources_from_tool_calls(message),
    )
    return text, sources


def invoke_model_json(prompt: str, use_web: bool = False) -> tuple[dict[str, Any], list[dict[str, str]]]:
    payload: dict[str, Any] = {
        "model": MODEL_API_MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are an expert startup simulation model. Return valid JSON only.",
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": MODEL_API_TEMPERATURE,
        "response_format": {"type": "json_object"},
    }

    provider = detect_provider(MODEL_API_BASE_URL, MODEL_API_MODEL)
    if use_web and provider == "openrouter":
        payload["plugins"] = [{"id": "web", "max_results": 5}]
        payload["web_search_options"] = {"search_context_size": "high"}
    if provider == "groq":
        payload["temperature"] = max(MODEL_API_TEMPERATURE, 1e-8)

    last_error: Exception | None = None
    for attempt in range(3):
        try:
            response = requests.post(
                chat_completions_url(),
                headers=model_headers(),
                json=payload,
                timeout=MODEL_API_TIMEOUT_SECONDS,
            )
            response.raise_for_status()
            body = response.json()
            message = body["choices"][0]["message"]
            content = message.get("content", "")
            parsed = parse_json_content(content if isinstance(content, str) else json.dumps(content))
            return parsed, extract_sources_from_annotations(message)
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            status_code = getattr(getattr(exc, "response", None), "status_code", None)
            if status_code == 429:
                time.sleep(2.5 + attempt * 2.5)
            else:
                time.sleep(1.2)
    raise RuntimeError(f"Model invocation failed after retries: {last_error}") from last_error


def run_json_agent(
    name: str,
    mission: str,
    schema: dict[str, Any],
    payload: dict[str, Any],
    context: dict[str, Any],
) -> dict[str, Any]:
    prompt = (
        f"You are {name} inside an AI startup simulator called LaunchMyIdea AI.\n"
        f"Mission: {mission}\n\n"
        "Respond with valid JSON only and match this schema shape exactly:\n"
        f"{json.dumps(schema, ensure_ascii=False, indent=2)}\n\n"
        "Reality seed:\n"
        f"{json.dumps(payload, ensure_ascii=False, indent=2)}\n\n"
        "Upstream context:\n"
        f"{json.dumps(context, ensure_ascii=False, indent=2)}\n\n"
        "Requirements:\n"
        "- Keep output concise but specific.\n"
        "- Preserve LaunchMyIdea AI branding naturally where useful.\n"
        "- Be concrete enough that the result can drive a product demo.\n"
        "- Do not wrap JSON in markdown fences.\n"
    )
    parsed, _sources = invoke_model_json(prompt, use_web=False)
    return parsed


def build_preview_html(title: str, thesis: str, channels: list[str], score: int) -> str:
    items = "".join(
        f'<li class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200">{channel}</li>'
        for channel in channels
    )
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <title>{title} - LaunchMyIdea AI</title>
</head>
<body class="min-h-screen bg-[#050816] text-white">
  <main class="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
    <div class="inline-flex w-fit items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-red-200">
      AMD Instinct Runtime
      <span class="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.8)]"></span>
    </div>
    <div class="mt-8 grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
      <section>
        <p class="text-sm uppercase tracking-[0.4em] text-zinc-400">LaunchMyIdea AI</p>
        <h1 class="mt-4 max-w-4xl text-5xl font-black leading-tight text-white">{title}</h1>
        <p class="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">{thesis}</p>
        <div class="mt-8 flex flex-wrap gap-3">
          <a class="rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(220,38,38,0.35)]" href="#report">Open simulation report</a>
          <a class="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-zinc-200" href="#channels">Inspect launch channels</a>
        </div>
      </section>
      <aside class="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div class="text-xs uppercase tracking-[0.3em] text-zinc-400">Readiness Score</div>
        <div class="mt-3 text-6xl font-black text-emerald-400">{score}</div>
        <div class="mt-4 h-3 overflow-hidden rounded-full bg-zinc-800">
          <div class="h-full rounded-full bg-gradient-to-r from-red-500 via-orange-400 to-emerald-400" style="width:{score}%"></div>
        </div>
        <p class="mt-6 text-sm leading-7 text-zinc-300">This preview is generated from the agent simulation so the team can pitch a startup world, not just a startup slide.</p>
      </aside>
    </div>
    <section id="channels" class="mt-16">
      <div class="text-xs uppercase tracking-[0.3em] text-zinc-400">First Wave Distribution</div>
      <ul class="mt-5 flex flex-wrap gap-3">{items}</ul>
    </section>
  </main>
</body>
</html>"""


def build_mock_research(payload: dict[str, str]) -> dict[str, Any]:
    idea = payload["idea"]
    category = payload["category"]
    seed = idea_fingerprint(idea)
    problem = seeded_score(seed, 1, 70, 92)
    market = seeded_score(seed, 2, 62, 88)
    mvp = seeded_score(seed, 3, 74, 92)
    differentiation = seeded_score(seed, 4, 58, 86)
    revenue = seeded_score(seed, 5, 55, 84)
    execution = seeded_score(seed, 6, 72, 94)

    if category == "student":
        problem += 4
        mvp += 3
    elif category == "fitness":
        market += 3
        revenue += 4
    elif category == "creator":
        market += 4
        differentiation += 2
    elif category == "climate":
        problem += 3
        execution -= 6
        differentiation += 5

    scorecard = {
        "problem": clamp(problem),
        "market": clamp(market),
        "mvp": clamp(mvp),
        "differentiation": clamp(differentiation),
        "revenue": clamp(revenue),
        "execution": clamp(execution),
    }
    scorecard["overall"] = clamp(round(mean(scorecard.values())), 58, 95)

    competitor_map = {
        "student": ["Quizlet", "Notion templates", "Studyverse", "general AI chatbots"],
        "fitness": ["MyFitnessPal", "Nike Training Club", "Fitbod", "generic AI coaches"],
        "creator": ["Hypefury", "Buffer", "Notion", "general AI assistants"],
        "climate": ["manual ops spreadsheets", "field-service SaaS", "energy monitoring tools", "local service aggregators"],
        "general": ["ChatGPT", "Notion AI", "Bubble", "generic startup-planning tools"],
    }
    demand_map = {
        "student": [
            "exam preparation and accountability pain repeat seasonally",
            "students search for lightweight planning systems over complex productivity stacks",
            "peer-sharing loops can create organic adoption inside campuses",
        ],
        "fitness": [
            "beginners want simple plans rather than expert jargon",
            "habit accountability remains a stronger retention driver than raw content volume",
            "short-form proof and milestone sharing can accelerate acquisition",
        ],
        "creator": [
            "content fatigue increases demand for planning automation",
            "solo creators need faster packaging and scheduling workflows",
            "distribution support matters as much as idea generation",
        ],
        "climate": [
            "rising operational costs increase appetite for savings-led automation",
            "sustainability narratives become stronger when tied to measurable ROI",
            "service-heavy climate products need trust and reliability proof early",
        ],
        "general": [
            "founders increasingly want execution support instead of blank AI chats",
            "visible orchestration helps startup tools feel more credible",
            "compressed build cycles increase the value of early validation",
        ],
    }
    monetization_map = {
        "student": [
            "freemium entry with paid accountability upgrades",
            "premium study packs or institution bundles",
            "upsell on export, reminders, and performance analytics",
        ],
        "fitness": [
            "subscription for adaptive plans and progress coaching",
            "premium challenge modes or coach collaboration",
            "upsell on nutrition and accountability layers",
        ],
        "creator": [
            "monthly creator workspace subscription",
            "team seats for agencies and creator teams",
            "upsell on brand voice and performance analytics",
        ],
        "climate": [
            "subscription tied to route, maintenance, or energy savings",
            "higher-ticket B2B pilots with operational ROI proof",
            "service and monitoring add-ons after installation",
        ],
        "general": [
            "founder workspace subscriptions",
            "team tiers for collaboration and exports",
            "upsell on deeper simulations and persistent artifacts",
        ],
    }

    risks = [
        "The first-run wow moment may not convert into repeat usage.",
        "Distribution may be harder than product generation if the wedge stays broad.",
        "Without measurable proof, the startup can look like a generic AI wrapper.",
    ]
    if category == "climate":
        risks.insert(0, "Operational complexity and field execution can delay proof of value.")
    if category == "creator":
        risks.insert(0, "Tool fatigue is high, so positioning must be painfully clear.")

    base_users = 60 + (scorecard["market"] - 50) * 3 + (scorecard["revenue"] - 50)
    multiplier = 1.45 + ((seed % 9) / 20)
    months: list[dict[str, Any]] = []
    current = max(80, base_users)
    for index in range(6):
        months.append(
            {
                "label": f"M{index + 1}",
                "users": int(current),
                "usersLabel": format_users(int(current)),
            }
        )
        current *= multiplier

    return {
        "summary": (
            f"{idea} shows the strongest early promise when positioned around {payload['differentiator']} "
            "and validated through a narrow first audience."
        ),
        "target_user": payload["audience"],
        "target_pain": payload["problem"],
        "market_opportunity": f"{payload['audience']} already feel the pain of {payload['problem'].lower()}",
        "why_now": payload["key_signals"],
        "competitors": competitor_map.get(category, competitor_map["general"]),
        "demand_signals": demand_map.get(category, demand_map["general"]),
        "monetization_signals": monetization_map.get(category, monetization_map["general"]),
        "risks": dedupe_strings(risks),
        "scorecard": scorecard,
        "growth_projection": {
            "months": months,
            "summary": f"Projected traction reaches {months[-1]['usersLabel']} active users by month 6 if the first wedge converts.",
        },
        "stage_insights": {
            "seed": f"Reality seed anchored around {payload['audience']} and the pain of {payload['problem'].lower()}",
            "strategy": f"Wedge the story around {payload['differentiator']}.",
            "world": "Model attention, retention, and monetization as separate pressures on the company.",
            "agents": "Use specialist agents so the user can inspect strategy, product, build, launch, finance, and critique in parallel.",
            "build": f"First release scope: {payload['mvp_scope']}",
            "launch": "Lead with the fastest channel that can produce believable proof in a week.",
            "finance": "Keep monetization simple enough that the first year story remains credible.",
            "critic": "Pressure-test repeat usage, not just the first-run spectacle.",
            "report": "The final report should combine grounded research, visible orchestration, and next-step clarity.",
        },
        "sources": [],
    }


def build_search_backed_research(payload: dict[str, str], sources: list[dict[str, str]]) -> dict[str, Any]:
    research = build_mock_research(payload)
    evidence_lines = [source.get("note") or source.get("title") or "" for source in sources]
    evidence_blob = " ".join(evidence_lines).lower()

    market_bonus = 4 if any(token in evidence_blob for token in ["market", "growth", "demand", "adoption"]) else 0
    revenue_bonus = 4 if any(token in evidence_blob for token in ["pricing", "subscription", "revenue", "saas"]) else 0
    execution_penalty = 4 if any(token in evidence_blob for token in ["regulation", "hardware", "complex", "cost"]) else 0

    scorecard = research["scorecard"]
    scorecard["market"] = clamp(scorecard["market"] + market_bonus)
    scorecard["revenue"] = clamp(scorecard["revenue"] + revenue_bonus)
    scorecard["execution"] = clamp(scorecard["execution"] - execution_penalty)
    scorecard["overall"] = clamp(round(mean(scorecard[key] for key in SCORE_KEYS)), 58, 96)

    if sources:
        research["summary"] = (
            f"{payload['idea']} shows live web evidence around {payload['audience']}, "
            "with current search results pointing to real demand, competition, and monetization patterns."
        )
        research["demand_signals"] = dedupe_strings(
            research["demand_signals"] + [source["title"] for source in sources[:2] if source.get("title")]
        )
        research["monetization_signals"] = dedupe_strings(
            research["monetization_signals"] + [source["note"] for source in sources[:2] if source.get("note")]
        )
    research["sources"] = sources[:6]
    return research


def run_research_agent(payload: dict[str, str]) -> dict[str, Any]:
    schema = {
        "summary": "string",
        "target_user": "string",
        "target_pain": "string",
        "market_opportunity": "string",
        "why_now": "string",
        "competitors": ["string"],
        "demand_signals": ["string"],
        "monetization_signals": ["string"],
        "risks": ["string"],
        "scorecard": {
            "problem": 0,
            "market": 0,
            "mvp": 0,
            "differentiation": 0,
            "revenue": 0,
            "execution": 0,
            "overall": 0,
        },
        "growth_projection": {
            "months": [{"label": "M1", "users": 0, "usersLabel": "0"}],
            "summary": "string",
        },
        "stage_insights": {
            "seed": "string",
            "strategy": "string",
            "world": "string",
            "agents": "string",
            "build": "string",
            "launch": "string",
            "finance": "string",
            "critic": "string",
            "report": "string",
        },
        "sources": [{"title": "string", "url": "string", "note": "string"}],
    }
    prompt = (
        "You are the Research and Validation Engine inside LaunchMyIdea AI.\n"
        "Research the startup idea using current web information when available.\n"
        "Return valid JSON only matching this schema exactly:\n"
        f"{json.dumps(schema, ensure_ascii=False, indent=2)}\n\n"
        "Startup brief:\n"
        f"{json.dumps(payload, ensure_ascii=False, indent=2)}\n\n"
        "Scoring instructions:\n"
        "- Every score must be an integer between 0 and 100.\n"
        "- Scores must be specific to this idea, not generic startup advice.\n"
        "- overall should be the weighted judgment of the startup's near-term launch readiness.\n"
        "- growth_projection must include 6 months exactly.\n"
        "- sources should include 3 to 6 real sources when web grounding is available.\n"
        "- stage_insights should be short, vivid, and specific enough to power a node graph.\n"
        "- Do not include markdown fences.\n"
    )
    provider = detect_provider(MODEL_API_BASE_URL, MODEL_API_MODEL)
    if provider == "groq":
        research_context, scraped_sources = build_search_context(payload)
        structured_prompt = prompt
        if research_context:
            structured_prompt += f"\n\nLive web research context gathered from current search results:\n{research_context}\n"
        try:
            parsed, parse_sources = invoke_model_json(structured_prompt, use_web=False)
            annotation_sources = merge_sources(scraped_sources, parse_sources)
        except RuntimeError:
            parsed = build_search_backed_research(payload, scraped_sources)
            annotation_sources = scraped_sources
    else:
        try:
            parsed, annotation_sources = invoke_model_json(prompt, use_web=True)
        except RuntimeError:
            parsed, annotation_sources = invoke_model_json(prompt, use_web=False)

    raw_sources = parsed.get("sources") if isinstance(parsed.get("sources"), list) else []
    parsed["sources"] = merge_sources(raw_sources, annotation_sources)
    parsed["competitors"] = dedupe_strings(parsed.get("competitors", []))
    parsed["demand_signals"] = dedupe_strings(parsed.get("demand_signals", []))
    parsed["monetization_signals"] = dedupe_strings(parsed.get("monetization_signals", []))
    parsed["risks"] = dedupe_strings(parsed.get("risks", []))

    scorecard = parsed.get("scorecard", {})
    normalized_scores = {}
    for key in SCORE_KEYS:
        normalized_scores[key] = clamp(int(scorecard.get(key, 70)))
    normalized_scores["overall"] = clamp(int(scorecard.get("overall", round(mean(normalized_scores.values())))), 58, 96)
    parsed["scorecard"] = normalized_scores

    months = parsed.get("growth_projection", {}).get("months", [])
    normalized_months: list[dict[str, Any]] = []
    for index, month in enumerate(months[:6]):
        users = max(10, int(month.get("users", 0)))
        normalized_months.append(
            {
                "label": str(month.get("label") or f"M{index + 1}"),
                "users": users,
                "usersLabel": str(month.get("usersLabel") or format_users(users)),
            }
        )
    if len(normalized_months) < 6:
        seed = idea_fingerprint(payload["idea"])
        current = max(80, 40 + normalized_scores["market"] * 2)
        for index in range(len(normalized_months), 6):
            current = int(current * (1.38 + (seed % 6) / 20))
            normalized_months.append(
                {
                    "label": f"M{index + 1}",
                    "users": current,
                    "usersLabel": format_users(current),
                }
            )
    parsed["growth_projection"] = {
        "months": normalized_months,
        "summary": str(parsed.get("growth_projection", {}).get("summary") or ""),
    }
    return parsed


def compute_score(outputs: dict[str, Any]) -> int:
    scorecard = outputs.get("research", {}).get("scorecard", {})
    values = [int(scorecard.get(key, 70)) for key in SCORE_KEYS]
    if not values:
        return 78
    return clamp(round(mean(values)), 58, 96)


def build_markdown_report(report: dict[str, Any]) -> str:
    outputs = report["outputs"]
    research = report["research"]
    scorecard = report["validation_scorecard"]

    def bullet_list(items: list[str]) -> str:
        return "\n".join(f"- {item}" for item in items)

    sources = research.get("sources", [])
    source_lines = []
    for source in sources:
        title = source.get("title", "Source")
        url = source.get("url", "")
        note = source.get("note", "")
        if url:
            source_lines.append(f"- [{title}]({url}) - {note}")
        elif note:
            source_lines.append(f"- {title} - {note}")

    return f"""# LaunchMyIdea AI

## Executive Summary
{report["executive_summary"]}

## Reality Seed
- Idea: {report["startup_brief"]["idea"]}
- Audience: {report["startup_brief"]["audience"]}
- Core Problem: {report["startup_brief"]["problem"]}
- Simulation Goal: {report["simulation_world"]["goal"]}

## Research Summary
{research["summary"]}

## Scorecard
- Problem clarity: {scorecard["problem"]}
- Market demand: {scorecard["market"]}
- MVP feasibility: {scorecard["mvp"]}
- Differentiation: {scorecard["differentiation"]}
- Revenue logic: {scorecard["revenue"]}
- Execution readiness: {scorecard["execution"]}
- Overall readiness: {scorecard["overall"]}

## Validation
- Market Opportunity: {outputs["validation"]["market_opportunity"]}
- Why Now: {outputs["validation"]["why_now"]}
- Differentiation: {outputs["validation"]["differentiation"]}
- Risks:
{bullet_list(outputs["validation"]["risks"])}

## Product Blueprint
- North Star: {outputs["product"]["north_star"]}
- Core Loop: {outputs["product"]["core_loop"]}
- MVP Features:
{bullet_list(outputs["product"]["mvp_features"])}

## Engineering Plan
- Stack: {", ".join(outputs["engineering"]["stack"])}
- Architecture:
{bullet_list(outputs["engineering"]["architecture"])}

```html
{outputs["engineering"]["preview_html"]}
```

## Launch Strategy
- Narrative: {outputs["marketing"]["narrative"]}
- Channels:
{bullet_list(outputs["marketing"]["channels"])}

## Finance
- Pricing: {outputs["finance"]["pricing"]}
- Revenue Logic: {outputs["finance"]["revenue_logic"]}
- Cost Drivers:
{bullet_list(outputs["finance"]["cost_drivers"])}

## Critic Review
- Main Failure Mode: {outputs["critic"]["main_failure_mode"]}
- Hardest Assumption: {outputs["critic"]["hardest_assumption"]}
- Fix First:
{bullet_list(outputs["critic"]["fix_first"])}

## Sources
{chr(10).join(source_lines) if source_lines else "- Live sources unavailable for this run."}
"""


def build_report_from_agents(request: StartupRequest, outputs: dict[str, Any]) -> dict[str, Any]:
    base = base_prompt_fields(request)
    research = outputs["research"]
    ceo = outputs["ceo"]
    product = outputs["product"]
    engineering = outputs["engineering"]
    marketing = outputs["marketing"]
    finance = outputs["finance"]
    critic = outputs["critic"]

    scorecard = research["scorecard"]
    preview_html = build_preview_html(
        ceo.get("title", "LaunchMyIdea AI"),
        engineering.get("preview_thesis", ceo.get("hypothesis", marketing.get("narrative", ""))),
        marketing.get("channels", []),
        int(outputs.get("score", scorecard["overall"])),
    )

    stage_insights = {
        "seed": research.get("stage_insights", {}).get("seed", research["summary"]),
        "strategy": ceo.get("hypothesis", research.get("stage_insights", {}).get("strategy", "")),
        "world": research.get("stage_insights", {}).get("world", ceo.get("market_forces", [""])[0]),
        "agents": research.get("stage_insights", {}).get("agents", "Specialist agents synchronized around one startup thesis."),
        "build": research.get("stage_insights", {}).get("build", engineering.get("architecture", [""])[0]),
        "launch": research.get("stage_insights", {}).get("launch", marketing.get("best_channel", "")),
        "finance": research.get("stage_insights", {}).get("finance", finance.get("revenue_logic", "")),
        "critic": research.get("stage_insights", {}).get("critic", critic.get("main_failure_mode", "")),
        "report": research.get("stage_insights", {}).get("report", research.get("growth_projection", {}).get("summary", "")),
    }

    return {
        "title": ceo.get("title", "LaunchMyIdea AI"),
        "readiness_score": int(outputs.get("score", scorecard["overall"])),
        "executive_summary": ceo.get("executive_summary", marketing.get("judge_pitch", "")),
        "startup_brief": {
            "idea": base["idea"],
            "audience": ceo.get("audience", research.get("target_user", base["audience"])),
            "problem": ceo.get("problem", research.get("target_pain", base["problem"])),
            "business_model": ceo.get("business_model", base["business_model"]),
            "tone": base["tone"],
            "constraints": base["constraints"],
            "seed_context": base["seed_context"],
            "key_signals": base["key_signals"],
            "amd_focus": base["amd_focus"],
        },
        "simulation_world": {
            "goal": ceo.get("goal", base["simulation_goal"]),
            "hypothesis": ceo.get("hypothesis", ""),
            "market_forces": ceo.get("market_forces", research.get("demand_signals", [])),
            "intervention_levers": ceo.get("intervention_levers", []),
            "simulation_modes": ceo.get("simulation_modes", []),
        },
        "agents": agent_roster(),
        "research": {
            "summary": research.get("summary", ""),
            "target_user": research.get("target_user", base["audience"]),
            "target_pain": research.get("target_pain", base["problem"]),
            "competitors": research.get("competitors", []),
            "demand_signals": research.get("demand_signals", []),
            "monetization_signals": research.get("monetization_signals", []),
            "sources": research.get("sources", []),
        },
        "validation_scorecard": scorecard,
        "growth_projection": research.get("growth_projection", {"months": [], "summary": ""}),
        "node_insights": stage_insights,
        "agent_findings": {
            "CEO Agent": ceo.get("hypothesis", ""),
            "Product Agent": product.get("core_loop", ""),
            "Engineer Agent": engineering.get("architecture", [""])[0] if engineering.get("architecture") else "",
            "Marketing Agent": marketing.get("best_channel", marketing.get("narrative", "")),
            "Finance Agent": finance.get("pricing", ""),
            "Critic Agent": critic.get("main_failure_mode", ""),
        },
        "outputs": {
            "validation": {
                "market_opportunity": research.get("market_opportunity", ceo.get("market_opportunity", "")),
                "why_now": research.get("why_now", ceo.get("why_now", "")),
                "differentiation": ceo.get("differentiation", ""),
                "risks": critic.get("risks", research.get("risks", [])),
                "target_user": research.get("target_user", base["audience"]),
                "competitors": research.get("competitors", []),
            },
            "product": {
                "north_star": product.get("north_star", ""),
                "core_loop": product.get("core_loop", ""),
                "mvp_features": product.get("mvp_features", []),
                "persona_tracks": product.get("persona_tracks", []),
                "first_release_scope": product.get("first_release_scope", base["mvp_scope"]),
            },
            "engineering": {
                "stack": engineering.get("stack", []),
                "architecture": engineering.get("architecture", []),
                "preview_html": preview_html,
            },
            "marketing": {
                "narrative": marketing.get("narrative", ""),
                "channels": marketing.get("channels", []),
                "hook_lines": marketing.get("hook_lines", []),
                "judge_pitch": marketing.get("judge_pitch", ""),
                "target_audience": marketing.get("target_audience", research.get("target_user", base["audience"])),
                "positioning": marketing.get("positioning", ceo.get("differentiation", "")),
                "sample_posts": marketing.get("sample_posts", []),
                "outreach": marketing.get("outreach", ""),
                "best_channel": marketing.get("best_channel", ""),
                "next_step": marketing.get("next_step", ""),
            },
            "finance": {
                "pricing": finance.get("pricing", ""),
                "revenue_logic": finance.get("revenue_logic", ""),
                "cost_drivers": finance.get("cost_drivers", []),
                "first_year": finance.get("first_year", ""),
            },
            "critic": {
                "main_failure_mode": critic.get("main_failure_mode", ""),
                "hardest_assumption": critic.get("hardest_assumption", ""),
                "fix_first": critic.get("fix_first", []),
            },
        },
    }


def fallback_agent_outputs_from_research(payload: dict[str, str], research: dict[str, Any]) -> dict[str, Any]:
    competitors = research.get("competitors", [])
    channels = research.get("demand_signals", [])[:2] + research.get("monetization_signals", [])[:1]
    best_channel = competitors[0] if competitors else "Community-led founder outreach"
    scorecard = research.get("scorecard", {})
    overall = int(scorecard.get("overall", 78))
    title = f"LaunchMyIdea AI for {payload['idea'][:48].strip()}"
    return {
        "research": research,
        "ceo": {
            "title": title,
            "executive_summary": research.get("summary", ""),
            "audience": research.get("target_user", payload["audience"]),
            "problem": research.get("target_pain", payload["problem"]),
            "business_model": payload["business_model"],
            "goal": payload["simulation_goal"],
            "hypothesis": (
                f"If {payload['audience']} get a focused system around {payload['differentiator']}, "
                "they will convert faster than with generic startup tooling."
            ),
            "market_opportunity": research.get("market_opportunity", ""),
            "why_now": research.get("why_now", ""),
            "differentiation": payload["differentiator"],
            "market_forces": research.get("demand_signals", []),
            "intervention_levers": [
                "compress validation into one visible workflow",
                "turn research into next-step execution artifacts",
                "keep the simulation inspectable instead of opaque",
            ],
            "simulation_modes": [
                "live validation",
                "agent debate",
                "launch rehearsal",
            ],
            "success_metrics": [
                f"readiness score above {overall}",
                "clear first wedge",
                "judge-ready launch story",
            ],
        },
        "product": {
            "north_star": "Help founders see a startup before they build it.",
            "core_loop": "Input idea, inspect agents, review scorecard, refine the wedge, relaunch.",
            "mvp_features": [
                "brief intake with startup constraints",
                "agent timeline and node graph",
                "validation scorecard with sources",
                "launch-ready report and preview page",
            ],
            "persona_tracks": [
                payload["audience"],
                "hackathon founders needing fast proof",
                "teams testing whether the wedge is worth building",
            ],
            "first_release_scope": payload["mvp_scope"],
        },
        "engineering": {
            "stack": ["React", "TanStack Start", "FastAPI", "Groq API"],
            "architecture": [
                "Frontend sends the startup brief to FastAPI.",
                "Backend gathers live search context and runs a compact multi-agent orchestration pass.",
                "Structured report powers the dashboard, validation stats, and node simulation.",
            ],
            "preview_thesis": (
                f"Show {payload['idea']} as a living startup system with evidence-backed validation and "
                "a visible execution path."
            ),
        },
        "marketing": {
            "narrative": (
                f"{payload['idea']} is positioned as a faster, clearer path for {payload['audience']} "
                "to move from interest to execution."
            ),
            "channels": dedupe_strings(channels + ["Product Hunt", "Founder communities", "LinkedIn build-in-public"]),
            "hook_lines": [
                f"Launch {payload['idea']} with a visible AI company behind it.",
                "Turn one startup idea into a report, launch path, and live simulation.",
                "See the market, the risks, and the build plan before you burn months shipping.",
            ],
            "judge_pitch": "LaunchMyIdea AI turns one idea into a visible startup execution system.",
            "target_audience": research.get("target_user", payload["audience"]),
            "positioning": payload["differentiator"],
            "sample_posts": [
                f"We tested {payload['idea']} through six AI agents and surfaced the first launch wedge.",
                "This is not another chatbot. It is a startup simulator with live evidence and execution logic.",
            ],
            "outreach": "Lead with one concrete founder pain, show the readiness score, then reveal the execution graph.",
            "best_channel": best_channel,
            "next_step": "Run targeted founder interviews against the strongest demand signal from the report.",
        },
        "finance": {
            "pricing": "Freemium workspace with a paid pro simulation tier and team seats.",
            "revenue_logic": "Free runs create interest, premium reports and collaboration capture monetization.",
            "cost_drivers": [
                "model inference cost per simulation",
                "frontend hosting and preview rendering",
                "research and observability infrastructure",
            ],
            "first_year": "Win early credibility through focused founder use cases, then expand into team workflows.",
        },
        "critic": {
            "main_failure_mode": research.get("risks", ["The value may feel impressive once but not sticky enough to repeat."])[0],
            "hardest_assumption": "Founders will return for iteration instead of treating the simulation like a one-off novelty.",
            "fix_first": [
                "Tighten the first audience instead of staying broad.",
                "Turn the top research signal into one measurable experiment.",
                "Make every agent output clearly actionable in the product UI.",
            ],
            "risks": research.get("risks", []),
        },
    }


def groq_live_agent_outputs(request: StartupRequest, job_id: str) -> dict[str, Any]:
    payload = base_prompt_fields(request)
    combined_schema = {
        "ceo": {
            "title": "string",
            "executive_summary": "string",
            "audience": "string",
            "problem": "string",
            "business_model": "string",
            "goal": "string",
            "hypothesis": "string",
            "market_opportunity": "string",
            "why_now": "string",
            "differentiation": "string",
            "market_forces": ["string"],
            "intervention_levers": ["string"],
            "simulation_modes": ["string"],
            "success_metrics": ["string"],
        },
        "product": {
            "north_star": "string",
            "core_loop": "string",
            "mvp_features": ["string"],
            "persona_tracks": ["string"],
            "first_release_scope": "string",
        },
        "engineering": {
            "stack": ["string"],
            "architecture": ["string"],
            "preview_thesis": "string",
        },
        "marketing": {
            "narrative": "string",
            "channels": ["string"],
            "hook_lines": ["string"],
            "judge_pitch": "string",
            "target_audience": "string",
            "positioning": "string",
            "sample_posts": ["string"],
            "outreach": "string",
            "best_channel": "string",
            "next_step": "string",
        },
        "finance": {
            "pricing": "string",
            "revenue_logic": "string",
            "cost_drivers": ["string"],
            "first_year": "string",
        },
        "critic": {
            "main_failure_mode": "string",
            "hardest_assumption": "string",
            "fix_first": ["string"],
            "risks": ["string"],
        },
    }

    set_stage_state(job_id, "seed", "running")
    append_activity(job_id, "Research Engine", "Pulling live search evidence and market signals for this exact startup idea.")
    research = run_research_agent(payload)
    set_stage_state(job_id, "seed", "complete")
    set_progress(job_id, 20)
    append_activity(job_id, "Research Engine", research["summary"], done=True)

    set_stage_state(job_id, "strategy", "running")
    append_activity(job_id, "Orchestrator", "Compressing the CEO, product, build, launch, finance, and critic passes into one fast Groq run.")
    prompt = (
        "You are the compact multi-agent runtime for LaunchMyIdea AI.\n"
        "Generate the final outputs for six agents using the research context below.\n"
        "Return valid JSON only matching this schema exactly:\n"
        f"{json.dumps(combined_schema, ensure_ascii=False, indent=2)}\n\n"
        "Startup brief:\n"
        f"{json.dumps(payload, ensure_ascii=False, indent=2)}\n\n"
        "Research context:\n"
        f"{json.dumps(research, ensure_ascii=False, indent=2)}\n\n"
        "Requirements:\n"
        "- Make every section specific to the startup idea.\n"
        "- Keep arrays concise, useful, and demo-ready.\n"
        "- The CEO, product, engineering, marketing, finance, and critic sections must feel distinct.\n"
        "- Do not include markdown fences.\n"
    )
    try:
        combined, _sources = invoke_model_json(prompt, use_web=False)
        outputs = {
            "research": research,
            "ceo": combined.get("ceo", {}),
            "product": combined.get("product", {}),
            "engineering": combined.get("engineering", {}),
            "marketing": combined.get("marketing", {}),
            "finance": combined.get("finance", {}),
            "critic": combined.get("critic", {}),
        }
    except Exception:
        outputs = fallback_agent_outputs_from_research(payload, research)

    set_stage_state(job_id, "strategy", "complete")
    set_progress(job_id, 34)
    append_activity(job_id, "CEO Agent", outputs["ceo"].get("hypothesis", "Startup thesis locked."), done=True)

    set_stage_state(job_id, "world", "running")
    append_activity(job_id, "CEO Agent", "Publishing world model, market forces, and intervention levers.")
    set_stage_state(job_id, "world", "complete")
    set_progress(job_id, 44)

    set_stage_state(job_id, "agents", "running")
    append_activity(job_id, "Orchestrator", "Specialist agent outputs synchronized from the Groq runtime.")
    set_stage_state(job_id, "agents", "complete")
    set_progress(job_id, 54)

    set_stage_state(job_id, "build", "running")
    append_activity(job_id, "Product Agent", outputs["product"].get("core_loop", "Core product loop defined."))
    append_activity(job_id, "Engineer Agent", outputs["engineering"].get("architecture", ["Build path ready."])[0])
    set_stage_state(job_id, "build", "complete")
    set_progress(job_id, 70)

    set_stage_state(job_id, "launch", "running")
    append_activity(job_id, "Marketing Agent", outputs["marketing"].get("best_channel", "Launch channel selected."))
    set_stage_state(job_id, "launch", "complete")
    set_progress(job_id, 82)

    set_stage_state(job_id, "finance", "running")
    append_activity(job_id, "Finance Agent", outputs["finance"].get("pricing", "Pricing logic modeled."))
    set_stage_state(job_id, "finance", "complete")
    set_progress(job_id, 90)

    set_stage_state(job_id, "critic", "running")
    append_activity(job_id, "Critic Agent", outputs["critic"].get("main_failure_mode", "Core risk surfaced."))
    set_stage_state(job_id, "critic", "complete")
    set_progress(job_id, 95)

    return outputs


def live_agent_outputs(request: StartupRequest, job_id: str) -> dict[str, Any]:
    payload = base_prompt_fields(request)
    provider = detect_provider(MODEL_API_BASE_URL, MODEL_API_MODEL)

    if provider == "groq":
        return groq_live_agent_outputs(request, job_id)

    ceo_schema = {
        "title": "string",
        "executive_summary": "string",
        "audience": "string",
        "problem": "string",
        "business_model": "string",
        "goal": "string",
        "hypothesis": "string",
        "market_opportunity": "string",
        "why_now": "string",
        "differentiation": "string",
        "market_forces": ["string"],
        "intervention_levers": ["string"],
        "simulation_modes": ["string"],
        "success_metrics": ["string"],
    }
    product_schema = {
        "north_star": "string",
        "core_loop": "string",
        "mvp_features": ["string"],
        "persona_tracks": ["string"],
        "first_release_scope": "string",
    }
    engineering_schema = {
        "stack": ["string"],
        "architecture": ["string"],
        "preview_thesis": "string",
    }
    marketing_schema = {
        "narrative": "string",
        "channels": ["string"],
        "hook_lines": ["string"],
        "judge_pitch": "string",
        "target_audience": "string",
        "positioning": "string",
        "sample_posts": ["string"],
        "outreach": "string",
        "best_channel": "string",
        "next_step": "string",
    }
    finance_schema = {
        "pricing": "string",
        "revenue_logic": "string",
        "cost_drivers": ["string"],
        "first_year": "string",
    }
    critic_schema = {
        "main_failure_mode": "string",
        "hardest_assumption": "string",
        "fix_first": ["string"],
        "risks": ["string"],
    }

    set_stage_state(job_id, "seed", "running")
    append_activity(job_id, "Research Engine", "Scanning live market signals and startup evidence for this exact idea.")
    research = run_research_agent(payload)
    set_stage_state(job_id, "seed", "complete")
    set_progress(job_id, 16)
    append_activity(job_id, "Research Engine", research["summary"], done=True)

    append_activity(job_id, "CEO Agent", "Parsing the research brief and framing the company thesis.")
    set_stage_state(job_id, "strategy", "running")
    ceo = run_json_agent(
        "CEO Agent",
        "Define the startup thesis, user wedge, world model, and validation story.",
        ceo_schema,
        payload,
        {"research": research, "amd_runtime": payload["amd_focus"]},
    )
    set_stage_state(job_id, "strategy", "complete")
    set_progress(job_id, 28)
    append_activity(job_id, "CEO Agent", f"Locked the thesis: {ceo['hypothesis']}", done=True)

    set_stage_state(job_id, "world", "running")
    append_activity(job_id, "CEO Agent", "Publishing market forces and simulation modes to the rest of the company.")
    set_stage_state(job_id, "world", "complete")
    set_progress(job_id, 38)

    set_stage_state(job_id, "agents", "running")
    append_activity(job_id, "Orchestrator", "Spawning specialist agents and distributing the research-backed CEO brief.")
    set_stage_state(job_id, "agents", "complete")
    set_progress(job_id, 46)

    set_stage_state(job_id, "build", "running")
    append_activity(job_id, "Product Agent", "Scoping the MVP loop from the strongest evidence and constraints.")
    append_activity(job_id, "Engineer Agent", "Designing the system stack and interactive preview path.")
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        product_future = pool.submit(
            run_json_agent,
            "Product Agent",
            "Define the founder-facing MVP, the sticky loop, and what the first release must include.",
            product_schema,
            payload,
            {"research": research, "ceo": ceo},
        )
        engineering_future = pool.submit(
            run_json_agent,
            "Engineer Agent",
            "Translate the startup thesis into a practical web architecture and preview-ready build story.",
            engineering_schema,
            payload,
            {"research": research, "ceo": ceo, "product": "in progress"},
        )
        product = product_future.result()
        engineering = engineering_future.result()
    set_stage_state(job_id, "build", "complete")
    set_progress(job_id, 62)
    append_activity(job_id, "Product Agent", f"Scoped {len(product['mvp_features'])} MVP features around the core loop.", done=True)
    append_activity(job_id, "Engineer Agent", f"Proposed stack: {', '.join(engineering['stack'][:3])}", done=True)

    set_stage_state(job_id, "launch", "running")
    append_activity(job_id, "Marketing Agent", "Crafting the launch narrative and first-wave channels.")
    append_activity(job_id, "Finance Agent", "Stress-testing pricing, cost drivers, and first-year logic.")
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        marketing_future = pool.submit(
            run_json_agent,
            "Marketing Agent",
            "Create the launch narrative, audience, hook lines, content examples, and distribution channels for a demo-stage startup.",
            marketing_schema,
            payload,
            {"research": research, "ceo": ceo, "product": product},
        )
        finance_future = pool.submit(
            run_json_agent,
            "Finance Agent",
            "Evaluate pricing, revenue logic, and operational cost drivers for the product direction.",
            finance_schema,
            payload,
            {"research": research, "ceo": ceo, "product": product, "engineering": engineering},
        )
        marketing = marketing_future.result()
        finance = finance_future.result()
    set_stage_state(job_id, "launch", "complete")
    set_progress(job_id, 75)
    append_activity(job_id, "Marketing Agent", f"Selected {len(marketing['channels'])} launch channels and a judge-facing pitch.", done=True)

    set_stage_state(job_id, "finance", "running")
    set_stage_state(job_id, "finance", "complete")
    set_progress(job_id, 84)
    append_activity(job_id, "Finance Agent", f"Defined pricing model: {finance['pricing']}", done=True)

    set_stage_state(job_id, "critic", "running")
    append_activity(job_id, "Critic Agent", "Attacking the plan before the judges or market can.")
    critic = run_json_agent(
        "Critic Agent",
        "Identify the main failure mode, the hardest assumption, and the highest-leverage fixes.",
        critic_schema,
        payload,
        {
            "research": research,
            "ceo": ceo,
            "product": product,
            "engineering": engineering,
            "marketing": marketing,
            "finance": finance,
        },
    )
    set_stage_state(job_id, "critic", "complete")
    set_progress(job_id, 92)
    append_activity(job_id, "Critic Agent", f"Flagged the core risk: {critic['main_failure_mode']}", done=True)

    return {
        "research": research,
        "ceo": ceo,
        "product": product,
        "engineering": engineering,
        "marketing": marketing,
        "finance": finance,
        "critic": critic,
    }


def mock_agent_outputs(request: StartupRequest, job_id: str) -> dict[str, Any]:
    payload = base_prompt_fields(request)
    research = build_mock_research(payload)

    channels = {
        "student": ["Discord study servers", "Campus ambassadors", "Telegram study groups", "YouTube Shorts"],
        "fitness": ["Instagram Reels", "Fitness creators", "Gym communities", "WhatsApp groups"],
        "creator": ["X / Twitter", "Creator Discords", "YouTube behind-the-scenes", "LinkedIn"],
        "climate": ["Local service partners", "Municipal pilots", "Industry associations", "Founder demos"],
        "general": ["Founder communities", "LinkedIn build thread", "Short-form demo video", "Hackathon stage demo"],
    }[payload["category"]]

    set_stage_state(job_id, "seed", "running")
    append_activity(job_id, "Research Engine", "Mock runtime generating idea-specific validation signals.")
    time.sleep(0.25)
    set_stage_state(job_id, "seed", "complete")
    set_progress(job_id, 16)
    append_activity(job_id, "Research Engine", research["summary"], done=True)

    ceo = {
        "title": "LaunchMyIdea AI",
        "executive_summary": (
            f"{payload['idea']} becomes more compelling when framed around {payload['differentiator']} "
            "and turned into a visible startup simulation rather than a static plan."
        ),
        "audience": research["target_user"],
        "problem": research["target_pain"],
        "business_model": payload["business_model"],
        "goal": payload["simulation_goal"],
        "hypothesis": f"If {payload['idea']} owns a sharper first wedge, it can earn attention before competitors feel inevitable.",
        "market_opportunity": research["market_opportunity"],
        "why_now": research["why_now"],
        "differentiation": f"{payload['headline']} with visible multi-agent execution and an AMD-backed runtime story.",
        "market_forces": research["demand_signals"],
        "intervention_levers": [
            "Narrow the first user wedge.",
            "Turn the first outcome into a shareable artifact.",
            "Make compute speed visible in the experience.",
        ],
        "simulation_modes": ["Founder mode", "Judge mode", "Capital-efficient mode"],
        "success_metrics": [
            "Judges understand the value in under 30 seconds.",
            "Founders want to rerun the simulation with new constraints.",
            "The AMD compute story feels visible, not hidden.",
        ],
    }
    set_stage_state(job_id, "strategy", "running")
    append_activity(job_id, "CEO Agent", "Mock runtime framing the company thesis.")
    time.sleep(0.2)
    set_stage_state(job_id, "strategy", "complete")
    set_progress(job_id, 28)
    append_activity(job_id, "CEO Agent", ceo["hypothesis"], done=True)

    set_stage_state(job_id, "world", "running")
    append_activity(job_id, "CEO Agent", "Mock runtime publishing market forces and simulation modes.")
    time.sleep(0.18)
    set_stage_state(job_id, "world", "complete")
    set_progress(job_id, 38)

    set_stage_state(job_id, "agents", "running")
    append_activity(job_id, "Orchestrator", "Mock runtime spawning specialist agents.")
    time.sleep(0.15)
    set_stage_state(job_id, "agents", "complete")
    set_progress(job_id, 46)

    product = {
        "north_star": f"Give {research['target_user']} a startup mirror world they can interrogate before committing real time and money.",
        "core_loop": "Brief -> validation -> scoped MVP -> launch plan -> critique -> rerun with tighter assumptions.",
        "mvp_features": [
            "Reality seed brief",
            "Live validation scorecard",
            "Node-based orchestration view",
            "Go-to-market plan",
            "Critic-backed next-step report",
        ],
        "persona_tracks": ["Founder", "Judge", "Technical builder"],
        "first_release_scope": payload["mvp_scope"],
    }
    engineering = {
        "stack": ["React + TanStack Router", "FastAPI", "Groq / AMD-compatible API", "Vercel"],
        "architecture": [
            "Frontend runs the orchestration shell and project workspace.",
            "Backend performs research, scoring, and specialist agent coordination.",
            "Simulation report becomes the single source of truth for every page.",
        ],
        "preview_thesis": payload["headline"],
    }
    set_stage_state(job_id, "build", "running")
    append_activity(job_id, "Product Agent", "Mock runtime scoping the MVP.")
    append_activity(job_id, "Engineer Agent", "Mock runtime sketching the system architecture.")
    time.sleep(0.28)
    set_stage_state(job_id, "build", "complete")
    set_progress(job_id, 62)
    append_activity(job_id, "Product Agent", product["north_star"], done=True)
    append_activity(job_id, "Engineer Agent", ", ".join(engineering["stack"]), done=True)

    marketing = {
        "narrative": f"{payload['idea']} should feel like the shortest path from raw idea to believable execution.",
        "channels": channels,
        "hook_lines": [
            "Six AI agents, one startup, one visible runtime.",
            "This is not a chatbot. It is a company in a sandbox.",
            "Show the idea thinking in parallel before the market tests it for real.",
        ],
        "judge_pitch": "We turned startup planning into an inspectable, agentic system where validation and execution happen in the same loop.",
        "target_audience": research["target_user"],
        "positioning": ceo["differentiation"],
        "sample_posts": [
            f"{payload['idea']} is now a visible startup simulation, not just a note in a docs folder.",
            f"LaunchMyIdea AI just turned this concept into product scope, GTM, finance, and critique in one run.",
            "Most tools give you advice. This one stages execution.",
        ],
        "outreach": f"Hey - we built a startup simulator for {research['target_user']}. Want to test this idea with your real constraints?",
        "best_channel": channels[0],
        "next_step": f"Run a 7-day test on {channels[0]} with one landing promise and one proof artifact.",
    }
    finance = {
        "pricing": "Free demo tier, pro founder tier, and team simulation workspace.",
        "revenue_logic": research["monetization_signals"][0],
        "cost_drivers": [
            "Model inference for research and agent turns",
            "Report storage and live preview generation",
            "Future integrations and deployment workflows",
        ],
        "first_year": research["growth_projection"]["summary"],
    }
    set_stage_state(job_id, "launch", "running")
    append_activity(job_id, "Marketing Agent", "Mock runtime building the launch narrative.")
    append_activity(job_id, "Finance Agent", "Mock runtime evaluating the business model.")
    time.sleep(0.22)
    set_stage_state(job_id, "launch", "complete")
    set_progress(job_id, 75)
    append_activity(job_id, "Marketing Agent", marketing["narrative"], done=True)

    set_stage_state(job_id, "finance", "running")
    time.sleep(0.15)
    set_stage_state(job_id, "finance", "complete")
    set_progress(job_id, 84)
    append_activity(job_id, "Finance Agent", finance["pricing"], done=True)

    critic = {
        "main_failure_mode": research["risks"][0],
        "hardest_assumption": "That a strong first simulation automatically creates repeat usage.",
        "fix_first": [
            "Make the first run produce something shareable.",
            "Tie each agent panel to a real decision the founder can change.",
            "Use faster grounded research to keep reruns meaningfully different.",
        ],
        "risks": research["risks"],
    }
    set_stage_state(job_id, "critic", "running")
    append_activity(job_id, "Critic Agent", "Mock runtime challenging the plan.")
    time.sleep(0.2)
    set_stage_state(job_id, "critic", "complete")
    set_progress(job_id, 92)
    append_activity(job_id, "Critic Agent", critic["main_failure_mode"], done=True)

    return {
        "research": research,
        "ceo": ceo,
        "product": product,
        "engineering": engineering,
        "marketing": marketing,
        "finance": finance,
        "critic": critic,
    }


def run_startup_simulation(job_id: str, request: StartupRequest) -> None:
    with jobs_lock:
        jobs[job_id] = {
            "status": "running",
            "report": None,
            "output": None,
            "error": None,
            "activity": [],
            "stages": fresh_stages(),
            "readiness": 4,
            "runtime": {
                "mock_mode": USE_MOCK,
                "model": MODEL_API_MODEL,
                "base_url": MODEL_API_BASE_URL,
                "provider": detect_provider(MODEL_API_BASE_URL, MODEL_API_MODEL),
                "mode": "multi-agent",
            },
            "started_at": int(time.time() * 1000),
            "completed_at": None,
        }

    append_activity(job_id, "Orchestrator", "Reality seed locked. Preparing the LaunchMyIdea AI runtime.", done=True)
    try:
        outputs = mock_agent_outputs(request, job_id) if USE_MOCK else live_agent_outputs(request, job_id)
        outputs["score"] = compute_score(outputs)
        set_stage_state(job_id, "report", "running")
        append_activity(job_id, "Orchestrator", "Synthesizing research and agent outputs into the final startup-world report.")
        report = build_report_from_agents(request, outputs)
        output = build_markdown_report(report)
        set_stage_state(job_id, "report", "complete")
        append_activity(job_id, "Orchestrator", "Final report published to the dashboard.", done=True)
        update_job(
            job_id,
            status="completed",
            report=report,
            output=output,
            readiness=report["readiness_score"],
            completed_at=int(time.time() * 1000),
        )
    except Exception as exc:
        append_activity(job_id, "Orchestrator", f"Simulation failed: {exc}")
        update_job(
            job_id,
            status="failed",
            error=str(exc),
            completed_at=int(time.time() * 1000),
        )


@app.post("/generate-startup")
async def generate_startup(request: StartupRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    background_tasks.add_task(run_startup_simulation, job_id, request)
    return {
        "job_id": job_id,
        "message": "Startup simulation initiated on the LaunchMyIdea AI orchestration layer.",
        "runtime": {
            "mock_mode": USE_MOCK,
            "model": MODEL_API_MODEL,
            "base_url": MODEL_API_BASE_URL,
            "provider": detect_provider(MODEL_API_BASE_URL, MODEL_API_MODEL),
            "mode": "multi-agent",
        },
    }


@app.get("/status/{job_id}")
async def get_status(job_id: str):
    return read_job(job_id)


@app.get("/health")
async def health():
    return {
        "ok": True,
        "mock_mode": USE_MOCK,
        "model": MODEL_API_MODEL,
        "base_url": MODEL_API_BASE_URL,
        "provider": detect_provider(MODEL_API_BASE_URL, MODEL_API_MODEL),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
