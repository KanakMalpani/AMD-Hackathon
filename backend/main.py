from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from crewai import Agent, Task, Crew, Process
from langchain_openai import ChatOpenAI
import os
import uuid

app = FastAPI(title="Autonomous Startup-in-a-Box API")

# =====================================================================
# Toggle this to False when your AMD server is ready!
USE_MOCK = True

# Initialize the LLM (Required for Agent validation, even if mocked later)
# TO CONNECT REAL AMD HARDWARE:
# 1. Start vLLM on your AMD server: `python -m vllm.entrypoints.openai.api_server --model <model_path>`
# 2. Update base_url to "http://<AMD_SERVER_IP>:8000/v1"
llm = ChatOpenAI(
    model="qwen-2.5-7b-instruct", 
    temperature=0.7,
    base_url="http://localhost:8000/v1", # Replace with AMD Server IP (e.g. 192.168.1.50)
    api_key="dummy"
)


# In-memory dictionary to store job status for the frontend
jobs = {}


class StartupRequest(BaseModel):
    idea: str

def run_startup_crew(job_id: str, idea: str):
    """
    This function runs the CrewAI agents in the background.
    It maps perfectly to your Readme's execution pipeline.
    """
    jobs[job_id] = {"status": "running", "output": None}
    
    try:
        if USE_MOCK:
            import time
            time.sleep(2) # Simulate processing
            result = f"""
# MOCK STARTUP PLAN: {idea}

## 1. Strategy (CEO)
Strategic summary of your startup idea. We will disrupt the market by leveraging AI and AMD compute stack.

## 2. Product (PM)
1. Core AI Dashboard
2. Real-time collaboration
3. Export to PDF

## 3. Engineering (Engineer)
FastAPI, React, Tailwind CSS, and vLLM running on AMD ROCm (MI300X optimized).

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <title>{idea} MVP</title>
</head>
<body class="bg-gray-900 text-white font-sans flex items-center justify-center h-screen">
    <div class="text-center p-10 bg-gray-800 rounded-2xl shadow-2xl max-w-2xl border border-gray-700">
        <h1 class="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700 mb-6">{idea}</h1>
        <p class="text-lg text-gray-300 mb-8">The fastest way to launch your dream. Powered by AMD Instinct.</p>
        <button class="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105">Get Early Access</button>
    </div>
</body>
</html>
```

## 4. Marketing (Marketing)
Go-to-market plan focuses on LinkedIn. Tagline: 'Startups at Light Speed'.

## 5. Finance (Finance)
Projected Year 1 Revenue: $500k. Estimated server costs: $50k.

## 6. Critique (Critic)
The plan is solid, but consider scaling the infrastructure earlier.
"""
        else:
            # 1. Define Agents (ONLY for real run)
            ceo = Agent(
                role='CEO',
                goal='Analyze the startup idea and create a high-level execution strategy.',
                backstory='You are a visionary Silicon Valley CEO who builds billion-dollar companies.',
                verbose=True,
                llm=llm
            )
            
            pm = Agent(
                role='Product Manager',
                goal='Define the MVP features, roadmap, and core user journey.',
                backstory='You are a data-driven PM who focuses on core user value and rapid iteration.',
                verbose=True,
                llm=llm
            )

            engineer = Agent(
                role='Engineer',
                goal='Outline the technical architecture and tech stack.',
                backstory='You are a pragmatic 10x developer who builds scalable systems on AMD hardware.',
                verbose=True,
                llm=llm
            )
            
            marketing = Agent(
                role='Marketing Specialist',
                goal='Create a comprehensive go-to-market strategy and brand positioning.',
                backstory='You are a growth hacker who knows how to make products go viral.',
                verbose=True,
                llm=llm
            )

            finance = Agent(
                role='Financial Analyst',
                goal='Develop revenue models and cost projections for the startup.',
                backstory='You are a former VC who knows exactly what makes a business profitable.',
                verbose=True,
                llm=llm
            )

            critic = Agent(
                role='Critical Reviewer',
                goal='Identify potential flaws in the startup plan and suggest improvements.',
                backstory='You are a professional skeptic who helps founders avoid common pitfalls.',
                verbose=True,
                llm=llm
            )

            # 2. Define Tasks
            strategy_task = Task(
                description=f'Analyze this startup idea: "{idea}". Provide a strategic summary.',
                expected_output='A strategic summary of the startup.',
                agent=ceo
            )
            
            product_task = Task(
                description='Based on the CEO strategy, list the top 3 core MVP features.',
                expected_output='A list of 3 core MVP features.',
                agent=pm
            )
            
            engineering_task = Task(
                description='Recommend a precise tech stack and system architecture for the MVP. AND crucially, write a complete, raw HTML file using Tailwind CSS via CDN for the startup landing page. Wrap the code in ```html blocks.',
                expected_output='A tech stack overview and a raw, functional HTML/Tailwind code block for a landing page.',
                agent=engineer
            )

            marketing_task = Task(
                description='Create a go-to-market plan and suggest a tagline for the product.',
                expected_output='A marketing strategy and brand tagline.',
                agent=marketing
            )

            finance_task = Task(
                description='Provide a basic 12-month revenue projection and cost estimate.',
                expected_output='A financial projection summary.',
                agent=finance
            )

            criticism_task = Task(
                description='Review the entire plan (Strategy, Product, Tech, Marketing, Finance) and provide 3 critical improvements.',
                expected_output='A list of 3 critical improvements and risk mitigations.',
                agent=critic
            )

            # 3. Create and Run the Crew
            crew = Crew(
                agents=[ceo, pm, engineer, marketing, finance, critic],
                tasks=[strategy_task, product_task, engineering_task, marketing_task, finance_task, criticism_task],
                process=Process.sequential
            )
            # Kickoff the real pipeline on AMD compute
            result = crew.kickoff()
        
        # Save output for frontend
        jobs[job_id] = {"status": "completed", "output": str(result)}


        
    except Exception as e:
        jobs[job_id] = {"status": "failed", "error": str(e)}

@app.post("/generate-startup")
async def generate_startup(request: StartupRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    # Run the heavy agent process in the background so the API doesn't block
    background_tasks.add_task(run_startup_crew, job_id, request.idea)
    return {"job_id": job_id, "message": "Agents deployed to AMD compute cluster."}

@app.get("/status/{job_id}")
async def get_status(job_id: str):
    return jobs.get(job_id, {"status": "not found"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
