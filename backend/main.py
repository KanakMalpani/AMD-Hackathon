import json
import os
import time
import uuid
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


llm = ChatOpenAI(
    model=AMD_LLM_MODEL,
    temperature=AMD_LLM_TEMPERATURE,
    base_url=AMD_LLM_BASE_URL,
    api_key=AMD_LLM_API_KEY,
)


jobs: dict[str, dict[str, Any]] = {}


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
    idea = request.idea.strip() or "Autonomous founder assistant"
    tone = request.tone.strip() or "Bold, cinematic, technically credible"
    audience = request.audience.strip() or classify_idea(idea)["segment"]
    problem = request.problem.strip() or "Founders move from inspiration to execution too slowly."
    business_model = request.businessModel.strip() or "Usage-based premium workspace with team tier."
    mvp_scope = request.mvpScope.strip() or "Simulation brief, multi-agent run, preview page, and launch report."
    seed_context = request.seedContext.strip() or "No extra dossier supplied. Use the idea itself as the reality seed."
    key_signals = request.keySignals.strip() or "AI-native workflows, shrinking startup cycles, higher founder expectations."
    simulation_goal = request.simulationGoal.strip() or "Pressure-test whether the startup can earn attention, retention, and revenue."
    amd_focus = request.amdFocus.strip() or "Use AMD GPUs for low-latency inference, visible concurrency, and demo impact."

    profile = classify_idea(idea)
    title = "Autonomous Startup-in-a-Box"
    readiness = 88
    launch_channels = ["Founder communities", "LinkedIn launch thread", "Short-form demo video", "Hackathon stage demo"]
    preview_html = build_preview_html(title, profile["headline"], launch_channels, readiness)

    return {
        "title": title,
        "readiness_score": readiness,
        "executive_summary": (
            f"{idea} becomes more compelling when framed as a live startup world simulation: "
            "the user submits a startup premise, agents model the company from multiple disciplines, "
            "and AMD-backed inference makes their collaboration visible in real time."
        ),
        "startup_brief": {
            "idea": idea,
            "audience": audience,
            "problem": problem,
            "business_model": business_model,
            "tone": tone,
            "constraints": request.constraints.strip() or "Preserve AMD branding, ship reliably on the web, and stay hackathon-demo friendly.",
            "seed_context": seed_context,
            "key_signals": key_signals,
            "amd_focus": amd_focus,
        },
        "simulation_world": {
            "goal": simulation_goal,
            "hypothesis": f"If {idea} is positioned around {profile['differentiator']}, it can win attention quickly.",
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
                "market_opportunity": f"{audience} already feel the pain of {problem.lower()}",
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
                "first_release_scope": mvp_scope,
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
                    "Backend manages job lifecycle, prompt packaging, and report generation.",
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


def build_prompt_for_llm(request: StartupRequest) -> str:
    payload = {
        "idea": request.idea,
        "audience": request.audience,
        "problem": request.problem,
        "business_model": request.businessModel,
        "mvp_scope": request.mvpScope,
        "tone": request.tone,
        "constraints": request.constraints,
        "seed_context": request.seedContext,
        "key_signals": request.keySignals,
        "simulation_goal": request.simulationGoal,
        "amd_focus": request.amdFocus,
    }
    schema = {
        "title": "string",
        "readiness_score": 0,
        "executive_summary": "string",
        "startup_brief": {
            "idea": "string",
            "audience": "string",
            "problem": "string",
            "business_model": "string",
            "tone": "string",
            "constraints": "string",
            "seed_context": "string",
            "key_signals": "string",
            "amd_focus": "string",
        },
        "simulation_world": {
            "goal": "string",
            "hypothesis": "string",
            "market_forces": ["string"],
            "intervention_levers": ["string"],
            "simulation_modes": ["string"],
        },
        "agents": [
            {
                "name": "string",
                "role": "string",
                "goal": "string",
                "style": "string",
                "deliverable": "string",
            }
        ],
        "outputs": {
            "validation": {
                "market_opportunity": "string",
                "why_now": "string",
                "differentiation": "string",
                "risks": ["string"],
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
                "preview_html": "full html document string",
            },
            "marketing": {
                "narrative": "string",
                "channels": ["string"],
                "hook_lines": ["string"],
                "judge_pitch": "string",
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
            },
        },
    }
    return (
        "You are the orchestration brain for an AMD hackathon product called "
        "'Autonomous Startup-in-a-Box'. Generate a powerful, credible startup simulation report. "
        "The response must be valid JSON only, with no markdown fences or commentary.\n\n"
        f"Request payload:\n{json.dumps(payload, ensure_ascii=False, indent=2)}\n\n"
        f"JSON schema shape:\n{json.dumps(schema, ensure_ascii=False, indent=2)}\n\n"
        "Requirements:\n"
        "- Preserve AMD branding and mention AMD compute advantage naturally.\n"
        "- Make the product feel like a visible multi-agent company simulator.\n"
        "- Keep claims ambitious but believable for a hackathon.\n"
        "- preview_html must be a complete responsive HTML document using Tailwind CDN.\n"
        "- readiness_score must be between 60 and 96.\n"
        "- All strings should be concise and high-signal.\n"
    )


def generate_report(request: StartupRequest) -> dict[str, Any]:
    if USE_MOCK:
        return build_mock_report(request)

    prompt = build_prompt_for_llm(request)
    response = llm.invoke(prompt)
    content = response.content if isinstance(response.content, str) else str(response.content)
    data = json.loads(content)
    return data


def run_startup_simulation(job_id: str, request: StartupRequest) -> None:
    jobs[job_id] = {"status": "running", "report": None, "output": None}
    try:
        if USE_MOCK:
            time.sleep(2)
        report = generate_report(request)
        output = build_markdown_report(report)
        jobs[job_id] = {
            "status": "completed",
            "report": report,
            "output": output,
        }
    except Exception as exc:
        jobs[job_id] = {"status": "failed", "error": str(exc)}


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
        },
    }


@app.get("/status/{job_id}")
async def get_status(job_id: str):
    return jobs.get(job_id, {"status": "not found"})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
