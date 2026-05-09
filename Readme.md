# 🚀 Autonomous Startup-in-a-Box (AMD Edition)
**Built for the AMD Developer Hackathon**

Autonomous Startup-in-a-Box is a high-concurrency, multi-agent AI system powered by **AMD Instinct/Radeon GPUs** and **ROCm**. It transforms a simple idea into a structured startup plan by orchestrating 6 specialized AI agents (CEO, PM, Engineer, Marketing, Finance, Critic) that collaborate in parallel to build your next venture.

---

## 🧠 The "AMD Wow Factor"
Traditional agentic workflows are often slow and sequential. This project leverages **AMD's high-memory bandwidth** and **ROCm-optimized vLLM serving** to enable two showstopper features:
1. **The Hardware Drag Race (Interactive Benchmark)**: The UI features a split-screen benchmark mode. Watch a simulated standard "Cloud CPU" struggle to generate a single strategy while the **AMD Instinct / ROCm** lane blitzes through the entire 6-agent company formation in seconds.
2. **Instant Live Render**: Because inference is so fast, the Engineer agent doesn't just write a plan; it generates raw, functional HTML/Tailwind code. The dashboard instantly renders the functional Landing Page inside a secure iframe the second the simulation finishes.

---

## 🏗️ System Architecture

### 1. The Brain (AMD Compute Stack)
- **Model**: Qwen-72B / Llama-3 (ROCm optimized)
- **Serving**: `vLLM` on AMD Instinct™ or Radeon™ GPUs.
- **Acceleration**: Full ROCm stack integration for extreme parallel inference.

### 2. The Orchestrator (Backend)
- **Framework**: FastAPI + CrewAI
- **Logic**: A 6-agent sequential pipeline with strict regex-enforced code generation.

### 3. The Dashboard (Frontend)
- **Framework**: React + TanStack Router + Tailwind
- **Visuals**: Split-screen CPU vs GPU benchmarking, real-time activity feeds, and an embedded `<iframe>` for live code rendering.

---

## 🧩 The 6-Agent Pipeline
1. **CEO**: Sets the vision and orchestrates the team.
2. **Product Manager**: Defines features and MVP scope.
3. **Engineer**: Architectures the tech stack and generates code scaffolds.
4. **Marketing**: Crafts the GTM strategy and social copy.
5. **Finance**: Projects revenue and validates business viability.
6. **Critic**: Identifies risks and forces high-quality iteration.

---

## 🚀 Quick Start

### Backend (Python)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
*Note: Set `USE_MOCK = False` in `main.py` and point to your AMD vLLM IP to use real hardware.*

### Frontend (React)
```bash
npm install
npm run dev
```

---

## 🎬 Demo Experience
Watch the agents collaborate live. The dashboard provides:
- **AMD Compute Panel**: Real-time metrics showing GPU acceleration status.
- **Agent Activity Feed**: Transcripts of the AI agents debating your idea.
- **Output Tabs**: High-fidelity plans for Code, Marketing, and Financials.

---

## 🏁 Conclusion
Most AI tools generate text. This system operationalizes ideas using the raw power of AMD hardware. By combining a structured multi-agent pipeline with ROCm-accelerated inference, we've built the fastest path from "Idea" to "Execution."