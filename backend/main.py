import concurrent.futures
import json
import os
import threading
import time
import uuid
from copy import deepcopy
from typing import Any

from fastapi import BackgroundTasks, FastAPI
from langchain_openai import ChatOpenAI
from pydantic import BaseModel


app = FastAPI(title="Autonomous Startup-in-a-Box API")


USE_MOCK = os.getenv("USE_MOCK", "true").lower() in {"1", "true", "yes"}
AMD_LLM_BASE_URL = os.getenv("AMD_LLM_BASE_URL", "http://localhost:8000/v1")
AMD_LLM_MODEL = os.getenv("AMD_LLM_MODEL", "qwen-2.5-7b-instruct")
AMD_LLM_API_KEY = os.getenv("AMD_LLM_API_KEY", "dummy")
AMD_LLM_TEMPERATURE = float(os.getenv("AMD_LLM_TEMPERATURE", "0.35"))


STAGE_TEMPLATE = [
    {
        "key": "seed",
        "title": "Reality Seed",
        "description": "Startup premise and source signals locked",
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


def get_llm() -> ChatOpenAI:
    return ChatOpenAI(
        model=AMD_LLM_MODEL,
        temperature=AMD_LLM_TEMPERATURE,
        base_url=AMD_LLM_BASE_URL,
        api_key=AMD_LLM_API_KEY,
    )


def fresh_stages() -> list[dict[str, str]]:
    stages: list[dict[str, str]] = []
    for index, stage in enumerate(STAGE_TEMPLATE):
        stages.append({**stage, "status": "complete" if index == 0 else "pending"})
    return stages


def classify_idea(idea: str) -> dict[str, str]:
    text = idea.lower()
    if any(token in text for token in ["student", "study", "exam", "campus", "learning"]):
        return {
            "segment": "student founders and education-focused builders",
            "differentiator": "turning chaotic exam or study pressure into an adaptive execution loop",
            "headline": "Simulate a better path from study stress to daily execution",
        }
    if any(token in text for token in ["fitness", "workout", "gym", "diet", "health"]):
        return {
            "segment": "fitness newcomers and habit-driven self-improvement users",
            "differentiator": "making motivation measurable through visible accountability loops",
            "headline": "Simulate the habit system before shipping the product",
        }
    if any(token in text for token in ["creator", "content", "youtube", "instagram", "tiktok", "newsletter"]):
        return {
            "segment": "solo creators trying to maintain consistency without burning out",
            "differentiator": "compressing ideation, packaging, and distribution into one workflow",
            "headline": "Simulate creator momentum before the content calendar slips",
        }
    return {
        "segment": "founders exploring a fresh startup wedge under uncertainty",
        "differentiator": "showing the startup as a living system instead of a static business plan",
        "headline": "Build the startup mirror world before burning real-world time",
    }


def base_prompt_fields(request: StartupRequest) -> dict[str, str]:
    profile = classify_idea(request.idea)
    return {
        "idea": request.idea.strip() or "Autonomous founder assistant",
        "audience": request.audience.strip() or profile["segment"],
        "problem": request.problem.strip() or "Founders move from inspiration to execution too slowly.",
        "business_model": request.businessModel.strip()
        or "Usage-based premium workspace with team tier.",
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
    return json.loads(text)


def run_json_agent(
    name: str,
    mission: str,
    schema: dict[str, Any],
    payload: dict[str, Any],
    context: dict[str, Any],
) -> dict[str, Any]:
    llm = get_llm()
    prompt = (
        f"You are {name} inside an AI startup simulator called Autonomous Startup-in-a-Box.\n"
        f"Mission: {mission}\n\n"
        "Respond with valid JSON only and match this schema shape exactly:\n"
        f"{json.dumps(schema, ensure_ascii=False, indent=2)}\n\n"
        "Reality seed:\n"
        f"{json.dumps(payload, ensure_ascii=False, indent=2)}\n\n"
        "Upstream context:\n"
        f"{json.dumps(context, ensure_ascii=False, indent=2)}\n\n"
        "Requirements:\n"
        "- Keep output concise but specific.\n"
        "- Preserve AMD branding naturally where useful.\n"
        "- Be concrete enough that the result can drive a product demo.\n"
        "- Do not wrap JSON in markdown fences.\n"
    )
    response = llm.invoke(prompt)
    content = response.content if isinstance(response.content, str) else str(response.content)
    return parse_json_content(content)


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
  <title>{title} - Autonomous Startup-in-a-Box</title>
</head>
<body class="min-h-screen bg-[#050816] text-white">
  <main class="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
    <div class="inline-flex w-fit items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-red-200">
      AMD Instinct Runtime
      <span class="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.8)]"></span>
    </div>
    <div class="mt-8 grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
      <section>
        <p class="text-sm uppercase tracking-[0.4em] text-zinc-400">Autonomous Startup-in-a-Box</p>
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


def build_markdown_report(report: dict[str, Any]) -> str:
    outputs = report["outputs"]
    product = outputs["product"]
    build = outputs["engineering"]
    marketing = outputs["marketing"]
    finance = outputs["finance"]
    critic = outputs["critic"]
    validation = outputs["validation"]

    def bullet_list(items: list[str]) -> str:
        return "\n".join(f"- {item}" for item in items)

    return f"""# Autonomous Startup-in-a-Box

## Executive Summary
{report["executive_summary"]}

## Reality Seed
- Idea: {report["startup_brief"]["idea"]}
- Audience: {report["startup_brief"]["audience"]}
- Core Problem: {report["startup_brief"]["problem"]}
- Simulation Goal: {report["simulation_world"]["goal"]}

## Validation
- Market Opportunity: {validation["market_opportunity"]}
- Why Now: {validation["why_now"]}
- Differentiation: {validation["differentiation"]}
- Risks:
{bullet_list(validation["risks"])}

## Product Blueprint
- North Star: {product["north_star"]}
- Core Loop: {product["core_loop"]}
- MVP Features:
{bullet_list(product["mvp_features"])}

## Engineering Plan
- Stack: {", ".join(build["stack"])}
- Architecture:
{bullet_list(build["architecture"])}

```html
{build["preview_html"]}
```

## Launch Strategy
- Narrative: {marketing["narrative"]}
- Channels:
{bullet_list(marketing["channels"])}

## Finance
- Pricing: {finance["pricing"]}
- Revenue Logic: {finance["revenue_logic"]}
- Cost Drivers:
{bullet_list(finance["cost_drivers"])}

## Critic Review
- Main Failure Mode: {critic["main_failure_mode"]}
- Hardest Assumption: {critic["hardest_assumption"]}
- Fix First:
{bullet_list(critic["fix_first"])}
"""


def build_mock_report(request: StartupRequest) -> dict[str, Any]:
    base = base_prompt_fields(request)
    profile = classify_idea(base["idea"])
    title = "Autonomous Startup-in-a-Box"
    readiness = 88
    launch_channels = [
        "Founder communities",
        "LinkedIn launch thread",
        "Short-form demo video",
        "Hackathon stage demo",
    ]
    preview_html = build_preview_html(title, profile["headline"], launch_channels, readiness)

    return {
        "title": title,
        "readiness_score": readiness,
        "executive_summary": (
            f"{base['idea']} becomes more compelling when framed as a live startup world simulation: "
            "the user submits a startup premise, agents model the company from multiple disciplines, "
            "and AMD-backed inference makes their collaboration visible in real time."
        ),
        "startup_brief": {
            "idea": base["idea"],
            "audience": base["audience"],
            "problem": base["problem"],
            "business_model": base["business_model"],
            "tone": base["tone"],
            "constraints": base["constraints"],
            "seed_context": base["seed_context"],
            "key_signals": base["key_signals"],
            "amd_focus": base["amd_focus"],
        },
        "simulation_world": {
            "goal": base["simulation_goal"],
            "hypothesis": f"If {base['idea']} is positioned around {profile['differentiator']}, it can win attention quickly.",
            "market_forces": [
                "Users expect instant strategy synthesis, not static documents.",
                "Founders trust products more when they can inspect the agent reasoning process.",
                "Infrastructure stories land better when the hardware advantage is visible.",
            ],
            "intervention_levers": [
                "Tighten the target user wedge.",
                "Reduce the MVP to one unforgettable loop.",
                "Use AMD throughput as part of the narrative, not only the implementation.",
            ],
            "simulation_modes": [
                "Baseline founder run",
                "Aggressive GTM run",
                "Capital-efficient survival run",
            ],
        },
        "agents": agent_roster(),
        "outputs": {
            "validation": {
                "market_opportunity": f"{base['audience']} already feel the pain of {base['problem'].lower()}",
                "why_now": "AI agents are now credible enough to turn startup planning into an inspectable runtime experience.",
                "differentiation": (
                    "This product does not just answer questions. It stages a living company simulation "
                    "and exposes the work of each specialist agent."
                ),
                "risks": [
                    "Users may treat it like a novelty if the report is shallow.",
                    "The demo can feel fake if the runtime story is not grounded in AMD compute.",
                    "Too many panels can dilute the startup narrative.",
                ],
            },
            "product": {
                "north_star": "Give founders a startup mirror world they can interrogate before they commit real time and money.",
                "core_loop": "Input idea -> generate world seed -> simulate six specialist agents -> inspect report -> iterate.",
                "mvp_features": [
                    "Startup brief composer with reality-seed fields",
                    "Visible multi-agent execution timeline",
                    "Agent roster with responsibilities and outputs",
                    "Interactive launch report with live preview",
                    "AMD runtime credibility panel",
                ],
                "persona_tracks": [
                    "Founder / builder",
                    "Product manager",
                    "Investor or hackathon judge",
                ],
                "first_release_scope": base["mvp_scope"],
            },
            "engineering": {
                "stack": [
                    "React + TanStack Router",
                    "FastAPI orchestration backend",
                    "OpenAI-compatible AMD model endpoint",
                    "Vercel frontend deployment",
                ],
                "architecture": [
                    "Frontend runs the cinematic simulation shell and polling loop.",
                    "Backend manages job lifecycle, prompt packaging, and per-agent execution.",
                    "AMD model endpoint is injected by environment variables for hackathon or cloud deployment.",
                    "Mock mode remains available so the demo can still run without live compute.",
                ],
                "preview_html": preview_html,
            },
            "marketing": {
                "narrative": "Rehearse the future of a startup before spending the present on it.",
                "channels": launch_channels,
                "hook_lines": [
                    "Six AI agents, one startup, one visible simulation.",
                    "This is not a chatbot. It is a company in a sandbox.",
                    "AMD GPUs make the startup think in parallel.",
                ],
                "judge_pitch": (
                    "We turned startup planning into a high-fidelity, inspectable simulation where AMD acceleration is part of the user experience."
                ),
            },
            "finance": {
                "pricing": "Free demo tier, pro founder workspace, and team collaboration tier.",
                "revenue_logic": "Charge for deeper runs, exports, persistent workspaces, and team scenarios.",
                "cost_drivers": [
                    "GPU inference tokens during long-form simulations",
                    "Storage of reports and generated previews",
                    "Future integrations for data ingestion and deployment",
                ],
                "first_year": "Strong demo-led adoption if the wow moment converts into recurring founder workflows.",
            },
            "critic": {
                "main_failure_mode": "The product looks flashy but does not create repeat behavior after the first run.",
                "hardest_assumption": "Founders will return for iteration, not only for a one-time report.",
                "fix_first": [
                    "Make every run produce a shareable artifact worth revisiting.",
                    "Keep the visible agent process tied to useful decisions, not cosmetic animation.",
                    "Use AMD performance metrics as proof of system quality and scale.",
                ],
            },
        },
    }


def build_mock_agent_outputs(request: StartupRequest) -> dict[str, Any]:
    report = build_mock_report(request)
    return {
        "ceo": {
            "title": report["title"],
            "executive_summary": report["executive_summary"],
            "audience": report["startup_brief"]["audience"],
            "problem": report["startup_brief"]["problem"],
            "business_model": report["startup_brief"]["business_model"],
            "goal": report["simulation_world"]["goal"],
            "hypothesis": report["simulation_world"]["hypothesis"],
            "market_opportunity": report["outputs"]["validation"]["market_opportunity"],
            "why_now": report["outputs"]["validation"]["why_now"],
            "differentiation": report["outputs"]["validation"]["differentiation"],
            "market_forces": report["simulation_world"]["market_forces"],
            "intervention_levers": report["simulation_world"]["intervention_levers"],
            "simulation_modes": report["simulation_world"]["simulation_modes"],
            "success_metrics": [
                "Judges understand the product in under 30 seconds",
                "Founders want to rerun the simulation with new constraints",
                "AMD compute advantage feels visible, not hidden",
            ],
        },
        "product": report["outputs"]["product"],
        "engineering": {
            "stack": report["outputs"]["engineering"]["stack"],
            "architecture": report["outputs"]["engineering"]["architecture"],
            "preview_thesis": report["outputs"]["product"]["north_star"],
        },
        "marketing": report["outputs"]["marketing"],
        "finance": report["outputs"]["finance"],
        "critic": report["outputs"]["critic"] | {"risks": report["outputs"]["validation"]["risks"]},
    }


def build_report_from_agents(request: StartupRequest, outputs: dict[str, Any]) -> dict[str, Any]:
    base = base_prompt_fields(request)
    ceo = outputs["ceo"]
    product = outputs["product"]
    engineering = outputs["engineering"]
    marketing = outputs["marketing"]
    finance = outputs["finance"]
    critic = outputs["critic"]

    agent_list = agent_roster()
    preview_html = build_preview_html(
        ceo.get("title", "Autonomous Startup-in-a-Box"),
        engineering.get("preview_thesis", ceo.get("hypothesis", marketing.get("narrative", ""))),
        marketing.get("channels", []),
        int(outputs.get("score", 86)),
    )

    return {
        "title": ceo.get("title", "Autonomous Startup-in-a-Box"),
        "readiness_score": int(outputs.get("score", 86)),
        "executive_summary": ceo.get("executive_summary", marketing.get("judge_pitch", "")),
        "startup_brief": {
            "idea": base["idea"],
            "audience": ceo.get("audience", base["audience"]),
            "problem": ceo.get("problem", base["problem"]),
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
            "market_forces": ceo.get("market_forces", []),
            "intervention_levers": ceo.get("intervention_levers", []),
            "simulation_modes": ceo.get("simulation_modes", []),
        },
        "agents": agent_list,
        "outputs": {
            "validation": {
                "market_opportunity": ceo.get("market_opportunity", ""),
                "why_now": ceo.get("why_now", ""),
                "differentiation": ceo.get("differentiation", ""),
                "risks": critic.get("risks", []),
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


def compute_score(outputs: dict[str, Any]) -> int:
    product_features = len(outputs["product"].get("mvp_features", []))
    launch_channels = len(outputs["marketing"].get("channels", []))
    critic_actions = len(outputs["critic"].get("fix_first", []))
    score = 72 + min(product_features, 5) * 2 + min(launch_channels, 4) * 2 + min(critic_actions, 3)
    return max(68, min(score, 95))


def live_agent_outputs(request: StartupRequest, job_id: str) -> dict[str, Any]:
    payload = base_prompt_fields(request)

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

    append_activity(job_id, "CEO Agent", "Parsing the reality seed and framing the company thesis.")
    set_stage_state(job_id, "strategy", "running")
    ceo = run_json_agent(
        "CEO Agent",
        "Define the startup thesis, user wedge, world model, and validation story.",
        ceo_schema,
        payload,
        {"amd_runtime": payload["amd_focus"]},
    )
    set_stage_state(job_id, "strategy", "complete")
    set_progress(job_id, 24)
    append_activity(
        job_id,
        "CEO Agent",
        f"Locked the thesis: {ceo['hypothesis']}",
        done=True,
    )

    set_stage_state(job_id, "world", "running")
    append_activity(job_id, "CEO Agent", "Publishing market forces and simulation modes to the rest of the company.")
    set_stage_state(job_id, "world", "complete")
    set_progress(job_id, 34)

    set_stage_state(job_id, "agents", "running")
    append_activity(job_id, "Orchestrator", "Spawning specialist agents and distributing the CEO brief.")
    set_stage_state(job_id, "agents", "complete")
    set_progress(job_id, 40)

    set_stage_state(job_id, "build", "running")
    append_activity(job_id, "Product Agent", "Scoping the MVP loop and founder journey.")
    append_activity(job_id, "Engineer Agent", "Designing the system stack and interactive preview path.")
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        product_future = pool.submit(
            run_json_agent,
            "Product Agent",
            "Define the founder-facing MVP, the sticky loop, and what the first release must include.",
            product_schema,
            payload,
            {"ceo": ceo},
        )
        engineering_future = pool.submit(
            run_json_agent,
            "Engineer Agent",
            "Translate the startup thesis into a practical web architecture and preview-ready build story.",
            engineering_schema,
            payload,
            {"ceo": ceo, "product": "in progress"},
        )
        product = product_future.result()
        engineering = engineering_future.result()
    set_stage_state(job_id, "build", "complete")
    set_progress(job_id, 58)
    append_activity(
        job_id,
        "Product Agent",
        f"Scoped {len(product['mvp_features'])} MVP features around the core loop.",
        done=True,
    )
    append_activity(
        job_id,
        "Engineer Agent",
        f"Proposed stack: {', '.join(engineering['stack'][:3])}",
        done=True,
    )

    append_activity(job_id, "Marketing Agent", "Crafting the launch narrative and first-wave channels.")
    append_activity(job_id, "Finance Agent", "Stress-testing pricing, cost drivers, and first-year logic.")
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        marketing_future = pool.submit(
            run_json_agent,
            "Marketing Agent",
            "Create the launch narrative, hook lines, and distribution channels for a demo-stage startup.",
            marketing_schema,
            payload,
            {"ceo": ceo, "product": product},
        )
        finance_future = pool.submit(
            run_json_agent,
            "Finance Agent",
            "Evaluate pricing, revenue logic, and operational cost drivers for the product direction.",
            finance_schema,
            payload,
            {"ceo": ceo, "product": product, "engineering": engineering},
        )
        marketing = marketing_future.result()
        finance = finance_future.result()

    set_stage_state(job_id, "launch", "complete")
    set_progress(job_id, 69)
    append_activity(
        job_id,
        "Marketing Agent",
        f"Selected {len(marketing['channels'])} launch channels and a judge-facing pitch.",
        done=True,
    )

    set_stage_state(job_id, "finance", "running")
    set_stage_state(job_id, "finance", "complete")
    set_progress(job_id, 78)
    append_activity(
        job_id,
        "Finance Agent",
        f"Defined pricing model: {finance['pricing']}",
        done=True,
    )

    set_stage_state(job_id, "critic", "running")
    append_activity(job_id, "Critic Agent", "Attacking the plan before the judges or market can.")
    critic = run_json_agent(
        "Critic Agent",
        "Identify the main failure mode, the hardest assumption, and the highest-leverage fixes.",
        critic_schema,
        payload,
        {
            "ceo": ceo,
            "product": product,
            "engineering": engineering,
            "marketing": marketing,
            "finance": finance,
        },
    )
    set_stage_state(job_id, "critic", "complete")
    set_progress(job_id, 88)
    append_activity(
        job_id,
        "Critic Agent",
        f"Flagged the core risk: {critic['main_failure_mode']}",
        done=True,
    )

    return {
        "ceo": ceo,
        "product": product,
        "engineering": engineering,
        "marketing": marketing,
        "finance": finance,
        "critic": critic,
    }


def mock_agent_outputs(request: StartupRequest, job_id: str) -> dict[str, Any]:
    outputs = build_mock_agent_outputs(request)

    set_stage_state(job_id, "strategy", "running")
    append_activity(job_id, "CEO Agent", "Mock runtime framing the company thesis.")
    time.sleep(0.4)
    set_stage_state(job_id, "strategy", "complete")
    set_progress(job_id, 22)
    append_activity(job_id, "CEO Agent", outputs["ceo"]["hypothesis"], done=True)

    set_stage_state(job_id, "world", "running")
    append_activity(job_id, "CEO Agent", "Mock runtime publishing market forces and intervention levers.")
    time.sleep(0.3)
    set_stage_state(job_id, "world", "complete")
    set_progress(job_id, 33)

    set_stage_state(job_id, "agents", "running")
    append_activity(job_id, "Orchestrator", "Mock runtime spawning specialist agents.")
    time.sleep(0.2)
    set_stage_state(job_id, "agents", "complete")
    set_progress(job_id, 40)

    set_stage_state(job_id, "build", "running")
    append_activity(job_id, "Product Agent", "Mock runtime scoping the MVP.")
    append_activity(job_id, "Engineer Agent", "Mock runtime sketching the system architecture.")
    time.sleep(0.5)
    set_stage_state(job_id, "build", "complete")
    set_progress(job_id, 58)
    append_activity(job_id, "Product Agent", outputs["product"]["north_star"], done=True)
    append_activity(job_id, "Engineer Agent", ", ".join(outputs["engineering"]["stack"]), done=True)

    set_stage_state(job_id, "launch", "running")
    append_activity(job_id, "Marketing Agent", "Mock runtime building the launch narrative.")
    time.sleep(0.3)
    set_stage_state(job_id, "launch", "complete")
    set_progress(job_id, 69)
    append_activity(job_id, "Marketing Agent", outputs["marketing"]["narrative"], done=True)

    set_stage_state(job_id, "finance", "running")
    append_activity(job_id, "Finance Agent", "Mock runtime evaluating the business model.")
    time.sleep(0.3)
    set_stage_state(job_id, "finance", "complete")
    set_progress(job_id, 78)
    append_activity(job_id, "Finance Agent", outputs["finance"]["pricing"], done=True)

    set_stage_state(job_id, "critic", "running")
    append_activity(job_id, "Critic Agent", "Mock runtime challenging the plan.")
    time.sleep(0.4)
    set_stage_state(job_id, "critic", "complete")
    set_progress(job_id, 88)
    append_activity(job_id, "Critic Agent", outputs["critic"]["main_failure_mode"], done=True)

    return outputs


def run_startup_simulation(job_id: str, request: StartupRequest) -> None:
    with jobs_lock:
        jobs[job_id] = {
            "status": "running",
            "report": None,
            "output": None,
            "error": None,
            "activity": [],
            "stages": fresh_stages(),
            "readiness": 6,
            "runtime": {
                "mock_mode": USE_MOCK,
                "model": AMD_LLM_MODEL,
                "base_url": AMD_LLM_BASE_URL,
                "mode": "multi-agent",
            },
            "started_at": int(time.time() * 1000),
            "completed_at": None,
        }

    append_activity(job_id, "Orchestrator", "Reality seed locked. Preparing the AMD multi-agent runtime.", done=True)
    try:
        if USE_MOCK:
            outputs = mock_agent_outputs(request, job_id)
        else:
            outputs = live_agent_outputs(request, job_id)

        outputs["score"] = compute_score(outputs)
        set_stage_state(job_id, "report", "running")
        append_activity(job_id, "Orchestrator", "Synthesizing agent outputs into the final startup-world report.")
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
        "message": "Startup simulation initiated on the AMD orchestration layer.",
        "runtime": {
            "mock_mode": USE_MOCK,
            "model": AMD_LLM_MODEL,
            "base_url": AMD_LLM_BASE_URL,
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
        "model": AMD_LLM_MODEL,
        "base_url": AMD_LLM_BASE_URL,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
