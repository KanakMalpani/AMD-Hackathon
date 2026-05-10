from pathlib import Path
import asyncio

import edge_tts


TEXT = (
    "We have all seen AI generate text. But in the real world, execution is everything. "
    "LaunchMyIdea AI shows how AMD-backed intelligence can take a startup idea and turn it into a visible company simulation. "
    "In this demo, a founder enters a concept like a solar powered autonomous lawn mowing subscription service and hits start. "
    "The orchestrator receives the prompt, then six specialist agents begin working. "
    "Now we enter the hardware drag race. On one side is a standard cloud CPU flow. On the other is our AMD Instinct and ROCm lane. "
    "The difference is immediate. While the CPU path is still initializing and fighting through strategy, the AMD powered runtime is already moving through parallel agent collaboration. "
    "The CEO defines the thesis. The Product agent locks the MVP. The Engineer scaffolds the build. Marketing shapes the launch story. Finance models the revenue. The Critic attacks weak assumptions. "
    "That is the power of high concurrency. "
    "And then comes the reveal. The Engineer agent does not stop at a plan. It prepares code ready output and a live product preview, so the startup feels real before anyone has written it by hand. "
    "Most systems give you words. LaunchMyIdea AI gives you execution."
)


async def main() -> None:
    out_path = Path("public/voiceover/launchmyidea-ai-tutorial.mp3")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    communicate = edge_tts.Communicate(
        TEXT,
        voice="en-US-AvaMultilingualNeural",
        rate="-9%",
        pitch="+0Hz",
    )
    await communicate.save(str(out_path))
    print(f"Saved voiceover to {out_path}")


if __name__ == "__main__":
    asyncio.run(main())
