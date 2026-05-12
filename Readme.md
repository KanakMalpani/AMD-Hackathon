<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/7/7c/AMD_Logo.svg" alt="AMD Logo" width="150"/>
  <h1>🚀 LaunchMyIdea AI</h1>
  <p><strong>Powered by AMD Instinct™ & Radeon™ GPUs via ROCm</strong></p>
  
  [![Hackathon](https://img.shields.io/badge/AMD-Developer_Hackathon-ED1C24?style=for-the-badge&logo=amd&logoColor=white)](https://www.amd.com/en/developer.html)
  [![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
  [![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
  [![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
</div>

<br/>

> **LaunchMyIdea AI** is a high-concurrency, multi-agent AI system that transforms a simple idea into a structured startup plan. By orchestrating **6 specialized AI agents** that collaborate in parallel, it builds your next venture in seconds—showcasing the raw compute power of AMD hardware.

---

## ✨ The "AMD Wow Factor"

Traditional agentic workflows are often slow and sequential. This project leverages **AMD's high-memory bandwidth** and **ROCm-optimized vLLM serving** to enable two showstopper features:

🏎️ **The Hardware Drag Race (Interactive Benchmark)**  
Watch a simulated standard "Cloud CPU" struggle to generate a single strategy while the **AMD Instinct / ROCm** lane blitzes through the entire 6-agent company formation in seconds.

⚡ **Instant Live Render**  
Because inference is so fast, the Engineer agent doesn't just write a plan; it generates raw, functional HTML/Tailwind code. The dashboard instantly renders the functional Landing Page inside a secure iframe the second the simulation finishes.

---

## 🏗️ System Architecture

### 🧠 1. The Brain (AMD Compute Stack)
- **Model**: Qwen-72B / Llama-3 (ROCm optimized)
- **Serving**: `vLLM` on AMD Instinct™ or Radeon™ GPUs
- **Acceleration**: Full ROCm stack integration for extreme parallel inference

### ⚙️ 2. The Orchestrator (Backend)
- **Framework**: FastAPI + CrewAI
- **Logic**: A 6-agent sequential pipeline with strict regex-enforced code generation

### 💻 3. The Dashboard (Frontend)
- **Framework**: React + TanStack Router + Tailwind CSS
- **Visuals**: Split-screen CPU vs GPU benchmarking, real-time activity feeds, and embedded `<iframe>` for live code rendering

---

## 🤝 The 6-Agent Pipeline

Our autonomous corporate team works in parallel to bring ideas to life:

| Agent | Role | Responsibilities |
| :--- | :--- | :--- |
| 👔 **CEO** | Strategic Leader | Sets the vision, breaks down tasks, and orchestrates the team. |
| 📋 **Product Manager** | Product Thinker | Defines features, creates roadmaps, and structures the MVP. |
| 💻 **Engineer** | Developer | Architects the tech stack and generates functional code scaffolds. |
| 📈 **Marketing** | Growth Strategist | Crafts the GTM strategy, campaigns, and social media copy. |
| 💰 **Finance** | Analyst | Projects revenue, estimates costs, and validates business viability. |
| 🧐 **Critic** | Challenger | Identifies risks, forces high-quality iteration, and ensures robustness. |

---

## 🚀 Quick Start

Get the multi-agent system running locally.

### 🐍 Backend (Python)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
> **Note:** Set `USE_MOCK = False` in `main.py` and point to your AMD vLLM IP to use real hardware.

### ⚛️ Frontend (React)
```bash
cd frontend  # or wherever the frontend is located
npm install
npm run dev
```

### ▲ Vercel Deployment
This frontend now builds in SPA mode for reliable Vercel hosting with client-side route refresh support.

- Set the Vercel root to the project folder that contains `package.json`
- Keep the build command as `npm run build`
- Keep the output directory as `dist/client`
- Add `VITE_API_BASE_URL` in Vercel if you want the simulation screen to talk to a deployed backend instead of local FastAPI

Example local env:
```bash
VITE_API_BASE_URL=http://localhost:8001
```

### Runtime Configuration
This build now supports a richer startup-world simulation flow inspired by MiroFish while preserving the AMD hackathon branding.

Use these environment variables for the backend:
```bash
USE_MOCK=false
MODEL_API_BASE_URL=https://api.groq.com/openai/v1
MODEL_API_MODEL=llama-3.1-8b-instant
MODEL_API_KEY=your_api_key
MODEL_API_TEMPERATURE=0.25
```

Why this default is used:
- `llama-3.1-8b-instant` on Groq is a strong free-tier-friendly default for fast startup simulation loops.
- This keeps the app usable without paid OpenRouter credits while still supporting live research-backed validation and agent orchestration.

You can still point the same backend at an AMD-hosted OpenAI-compatible endpoint later:
- set `MODEL_API_BASE_URL` to your AMD endpoint
- set `MODEL_API_MODEL` to the model name served there
- keep `USE_MOCK=false`
- keep `VITE_API_BASE_URL` pointed at the FastAPI backend that fronts the simulation

Backward compatibility note:
- the backend still accepts the older `AMD_LLM_*` variables if you already use them
- `GROQ_API_KEY` and `GROQ_MODEL` are accepted as aliases
- `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` are still accepted if you switch providers later

The frontend now expects the backend to return a structured simulation report with:
- startup brief
- simulation world and agent roster
- validation, product, engineering, launch, finance, and critic outputs
- live preview HTML for the generated startup artifact

### Tutorial Video
This repo now includes a 90-second Remotion product demo with English voiceover, centered on the live simulation flow, hardware drag race, and generated preview reveal.

Commands:
```bash
npm run tutorial:voiceover
npm run tutorial:studio
npm run tutorial:render
```

Rendered output:
```bash
renders/launchmyidea-ai-tutorial.mp4
```

---

## 🎬 The Demo Experience

Experience the agents collaborating live. The dynamic dashboard provides:
- 📊 **AMD Compute Panel**: Real-time metrics showing GPU acceleration status.
- 💬 **Agent Activity Feed**: Live transcripts of the AI agents debating and building your idea.
- 📑 **Output Tabs**: High-fidelity plans for Code, Marketing, and Financials.

---

## 🏁 Conclusion

Most AI tools just generate text. This system operationalizes ideas using the raw power of AMD hardware. By combining a structured multi-agent pipeline with ROCm-accelerated inference, we've built the **fastest path from "Idea" to "Execution."**

<div align="center">
  <p>Built with ❤️ for the AMD Developer Hackathon</p>
</div>
