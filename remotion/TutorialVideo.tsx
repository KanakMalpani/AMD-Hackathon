import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const palette = {
  bg: "#050816",
  panel: "rgba(15, 23, 42, 0.84)",
  panelSoft: "rgba(255, 255, 255, 0.06)",
  border: "rgba(255, 255, 255, 0.14)",
  red: "#ED1C24",
  redSoft: "rgba(237, 28, 36, 0.18)",
  green: "#3CFF7A",
  text: "#F8FAFC",
  muted: "#94A3B8",
};

const sceneDurations = [150, 150, 150, 150, 150, 150];
const sceneTitles = [
  "What this site does",
  "Step 1: Enter the runtime",
  "Step 2: Create the brief",
  "Step 3: Run the startup world",
  "Step 4: Read the outputs",
  "README in 5 points",
];

const cardStyle: React.CSSProperties = {
  background: palette.panel,
  border: `1px solid ${palette.border}`,
  borderRadius: 28,
  boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
  backdropFilter: "blur(16px)",
};

const titleStyle: React.CSSProperties = {
  fontSize: 76,
  fontWeight: 800,
  lineHeight: 1.02,
  letterSpacing: -2,
  margin: 0,
};

const bodyStyle: React.CSSProperties = {
  fontSize: 30,
  lineHeight: 1.45,
  color: palette.muted,
  margin: 0,
};

const BulletList: React.FC<{items: string[]; activeIndex?: number}> = ({items, activeIndex}) => {
  return (
    <div style={{display: "flex", flexDirection: "column", gap: 18}}>
      {items.map((item, index) => {
        const active = activeIndex === undefined ? true : index <= activeIndex;
        return (
          <div
            key={item}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              opacity: active ? 1 : 0.35,
              transform: `translateX(${active ? 0 : 18}px)`,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                background: active ? palette.green : palette.redSoft,
                boxShadow: active ? "0 0 18px rgba(60,255,122,0.7)" : "none",
              }}
            />
            <div style={{fontSize: 28, color: palette.text}}>{item}</div>
          </div>
        );
      })}
    </div>
  );
};

const FauxWindow: React.FC<{
  title: string;
  subtitle: string;
  children: React.ReactNode;
  accent?: string;
}> = ({title, subtitle, children, accent = palette.red}) => {
  return (
    <div style={{...cardStyle, padding: 28, display: "flex", flexDirection: "column", gap: 22}}>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <div>
          <div style={{fontSize: 32, color: palette.text, fontWeight: 700}}>{title}</div>
          <div style={{fontSize: 22, color: palette.muted, marginTop: 6}}>{subtitle}</div>
        </div>
        <div
          style={{
            padding: "10px 16px",
            borderRadius: 999,
            background: `${accent}22`,
            color: accent,
            border: `1px solid ${accent}66`,
            fontSize: 18,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 1.5,
          }}
        >
          Live
        </div>
      </div>
      {children}
    </div>
  );
};

const ProgressBar: React.FC<{progress: number}> = ({progress}) => (
  <div
    style={{
      height: 12,
      width: "100%",
      borderRadius: 999,
      background: "rgba(255,255,255,0.08)",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        height: "100%",
        width: `${progress}%`,
        background: "linear-gradient(90deg,#ED1C24,#3CFF7A)",
      }}
    />
  </div>
);

const SceneChrome: React.FC<{sceneIndex: number; children: React.ReactNode}> = ({
  sceneIndex,
  children,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const reveal = spring({
    frame,
    fps,
    config: {damping: 16, stiffness: 120},
  });

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(circle at top right, rgba(237,28,36,0.18), transparent 28%),
          radial-gradient(circle at bottom left, rgba(60,255,122,0.12), transparent 26%),
          ${palette.bg}
        `,
        color: palette.text,
        fontFamily: "Inter, system-ui, sans-serif",
        padding: 64,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 28,
          border: `1px solid rgba(255,255,255,0.08)`,
          borderRadius: 36,
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
          transform: `translateY(${interpolate(reveal, [0, 1], [24, 0])}px)`,
          opacity: reveal,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 18,
              color: palette.red,
              textTransform: "uppercase",
              letterSpacing: 4,
              fontWeight: 700,
            }}
          >
            AMD Hackathon Tutorial
          </div>
          <div style={{fontSize: 42, fontWeight: 800, marginTop: 8}}>
            {sceneTitles[sceneIndex]}
          </div>
        </div>
        <div style={{display: "flex", gap: 10}}>
          {sceneTitles.map((_, index) => (
            <div
              key={index}
              style={{
                width: index === sceneIndex ? 48 : 12,
                height: 12,
                borderRadius: 999,
                background:
                  index === sceneIndex ? "linear-gradient(90deg,#ED1C24,#3CFF7A)" : palette.panelSoft,
              }}
            />
          ))}
        </div>
      </div>
      <div
        style={{
          flex: 1,
          transform: `scale(${interpolate(reveal, [0, 1], [0.96, 1])})`,
          opacity: reveal,
        }}
      >
        {children}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 28,
          color: palette.muted,
          fontSize: 20,
        }}
      >
        <div>30-second Remotion walkthrough</div>
        <div>autonomous startup-in-a-box</div>
      </div>
    </AbsoluteFill>
  );
};

const SceneOne: React.FC = () => {
  return (
    <SceneChrome sceneIndex={0}>
      <div style={{display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 36, height: "100%"}}>
        <div style={{...cardStyle, padding: 44, display: "flex", flexDirection: "column", justifyContent: "center"}}>
          <div
            style={{
              display: "inline-flex",
              padding: "12px 18px",
              borderRadius: 999,
              background: palette.redSoft,
              color: palette.red,
              fontSize: 18,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 2,
              width: "fit-content",
            }}
          >
            Startup simulator
          </div>
          <h1 style={{...titleStyle, marginTop: 24}}>
            One idea in.
            <br />
            Six agents out.
          </h1>
          <p style={{...bodyStyle, marginTop: 24}}>
            This site turns a raw startup idea into strategy, MVP scope, launch
            messaging, finance logic, and critic feedback.
          </p>
          <div style={{marginTop: 32}}>
            <BulletList
              items={[
                "Visible agent activity feed",
                "Live startup-world timeline",
                "Executive, build, launch, finance outputs",
              ]}
            />
          </div>
        </div>
        <FauxWindow title="Simulation Preview" subtitle="What the judges will see">
          <ProgressBar progress={88} />
          <div style={{display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16}}>
            {["CEO Strategy", "Agent Cast", "Build Plan", "Critic Loop"].map((item, index) => (
              <div
                key={item}
                style={{
                  padding: 20,
                  borderRadius: 22,
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${index === 0 ? "rgba(60,255,122,0.4)" : palette.border}`,
                }}
              >
                <div style={{fontSize: 16, color: palette.green, textTransform: "uppercase", letterSpacing: 1.8}}>
                  Stage {index + 1}
                </div>
                <div style={{fontSize: 24, marginTop: 10, fontWeight: 700}}>{item}</div>
              </div>
            ))}
          </div>
        </FauxWindow>
      </div>
    </SceneChrome>
  );
};

const SceneTwo: React.FC = () => {
  return (
    <SceneChrome sceneIndex={1}>
      <div style={{display: "grid", gridTemplateColumns: "0.95fr 1.05fr", gap: 36, height: "100%"}}>
        <FauxWindow title="Homepage" subtitle="Start from the landing screen">
          <div
            style={{
              flex: 1,
              borderRadius: 24,
              padding: 28,
              background:
                "linear-gradient(135deg, rgba(237,28,36,0.18), rgba(15,23,42,0.96))",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{fontSize: 18, color: palette.red, textTransform: "uppercase", letterSpacing: 3}}>
                Hero section
              </div>
              <div style={{fontSize: 54, fontWeight: 800, marginTop: 16, lineHeight: 1.05}}>
                Stop pitching
                <br />
                static startup plans.
              </div>
              <div style={{fontSize: 24, color: palette.muted, marginTop: 18, lineHeight: 1.4}}>
                Click the main CTA to move from the landing page into your workspace.
              </div>
            </div>
            <div
              style={{
                alignSelf: "flex-start",
                padding: "18px 28px",
                borderRadius: 999,
                background: palette.red,
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              Enter Runtime
            </div>
          </div>
        </FauxWindow>
        <div style={{...cardStyle, padding: 44}}>
          <h2 style={{fontSize: 54, margin: 0, fontWeight: 800}}>How to use it</h2>
          <div style={{marginTop: 24}}>
            <BulletList
              items={[
                "Open the homepage",
                "Click Enter Runtime or sign in",
                "Create a new startup workspace",
                "Move into the Brief screen",
              ]}
              activeIndex={3}
            />
          </div>
          <p style={{...bodyStyle, marginTop: 30}}>
            Think of this as entering a command center. The landing page sells the
            idea, but the real product begins after the CTA.
          </p>
        </div>
      </div>
    </SceneChrome>
  );
};

const SceneThree: React.FC = () => {
  return (
    <SceneChrome sceneIndex={2}>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, height: "100%"}}>
        <div style={{...cardStyle, padding: 42}}>
          <div style={{fontSize: 20, color: palette.red, textTransform: "uppercase", letterSpacing: 3}}>
            Reality Seed Brief
          </div>
          <h2 style={{fontSize: 58, margin: "18px 0 0", fontWeight: 800}}>Fill the startup brief</h2>
          <p style={{...bodyStyle, marginTop: 18}}>
            This page is where you tell the agents what company to simulate.
          </p>
          <div style={{marginTop: 28}}>
            <BulletList
              items={[
                "Startup idea",
                "Audience and problem",
                "Business model and MVP scope",
                "Signals, constraints, and AMD focus",
              ]}
              activeIndex={3}
            />
          </div>
        </div>
        <FauxWindow title="Prompt Fields" subtitle="Everything the agents need">
          <div style={{display: "flex", flexDirection: "column", gap: 14}}>
            {[
              "AI founder copilot for student builders",
              "Audience: student founders, campus teams",
              "Problem: too many ideas, not enough execution clarity",
              "AMD focus: show why fast multi-agent inference matters",
            ].map((line) => (
              <div
                key={line}
                style={{
                  borderRadius: 18,
                  padding: "18px 20px",
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${palette.border}`,
                  fontSize: 22,
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </FauxWindow>
      </div>
    </SceneChrome>
  );
};

const SceneFour: React.FC = () => {
  const frame = useCurrentFrame();
  const activeIndex = Math.min(5, Math.floor((frame % 150) / 22));
  const agents = ["CEO", "Product", "Engineer", "Marketing", "Finance", "Critic"];

  return (
    <SceneChrome sceneIndex={3}>
      <div style={{display: "grid", gridTemplateColumns: "0.92fr 1.08fr", gap: 36, height: "100%"}}>
        <div style={{...cardStyle, padding: 40}}>
          <h2 style={{fontSize: 56, margin: 0, fontWeight: 800}}>Run the simulation</h2>
          <p style={{...bodyStyle, marginTop: 18}}>
            Press Start. The backend orchestrator begins assigning work to the six
            specialist agents.
          </p>
          <div style={{marginTop: 28}}>
            <BulletList items={agents.map((a) => `${a} Agent works its role`)} activeIndex={activeIndex} />
          </div>
        </div>
        <FauxWindow title="Live Runtime" subtitle="Timeline + activity feed" accent={palette.green}>
          <div style={{display: "grid", gridTemplateColumns: "0.46fr 0.54fr", gap: 16}}>
            <div style={{display: "flex", flexDirection: "column", gap: 12}}>
              {["Reality Seed", "CEO Strategy", "Build Plan", "Launch Motion", "AMD Report"].map(
                (stage, index) => (
                  <div
                    key={stage}
                    style={{
                      padding: "16px 18px",
                      borderRadius: 18,
                      background:
                        index <= Math.floor(activeIndex / 1.2)
                          ? "rgba(60,255,122,0.12)"
                          : "rgba(255,255,255,0.04)",
                      border: `1px solid ${
                        index <= Math.floor(activeIndex / 1.2)
                          ? "rgba(60,255,122,0.5)"
                          : palette.border
                      }`,
                    }}
                  >
                    <div style={{fontSize: 15, color: palette.muted, textTransform: "uppercase", letterSpacing: 1.6}}>
                      Stage {index + 1}
                    </div>
                    <div style={{fontSize: 22, marginTop: 6, fontWeight: 700}}>{stage}</div>
                  </div>
                ),
              )}
            </div>
            <div style={{display: "flex", flexDirection: "column", gap: 12}}>
              {agents.slice(0, activeIndex + 1).map((agent, index) => (
                <div
                  key={agent}
                  style={{
                    padding: "14px 18px",
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${palette.border}`,
                  }}
                >
                  <div style={{fontSize: 18, color: palette.red, fontWeight: 700}}>
                    {agent} Agent
                  </div>
                  <div style={{fontSize: 18, color: palette.muted, marginTop: 6}}>
                    {index === activeIndex
                      ? "Working live..."
                      : "Delivered a startup-world update."}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FauxWindow>
      </div>
    </SceneChrome>
  );
};

const SceneFive: React.FC = () => {
  return (
    <SceneChrome sceneIndex={4}>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, height: "100%"}}>
        <FauxWindow title="Results Dashboard" subtitle="Where to read everything">
          <div style={{display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16}}>
            {[
              "Executive",
              "World",
              "Agents",
              "Build",
              "Launch",
              "Finance",
              "Critic",
              "Live Preview",
            ].map((tab, index) => (
              <div
                key={tab}
                style={{
                  padding: 20,
                  borderRadius: 20,
                  background: index === 0 ? palette.redSoft : "rgba(255,255,255,0.04)",
                  border: `1px solid ${index === 0 ? "rgba(237,28,36,0.45)" : palette.border}`,
                  fontSize: 22,
                  fontWeight: 700,
                }}
              >
                {tab}
              </div>
            ))}
          </div>
        </FauxWindow>
        <div style={{...cardStyle, padding: 42}}>
          <h2 style={{fontSize: 54, margin: 0, fontWeight: 800}}>What to open after a run</h2>
          <div style={{marginTop: 28}}>
            <BulletList
              items={[
                "Overview for the one-sentence pitch",
                "Simulation page for proof of agent work",
                "Output tabs for strategy, build, launch, and finance",
                "Live Preview for the generated startup artifact",
              ]}
              activeIndex={3}
            />
          </div>
          <p style={{...bodyStyle, marginTop: 28}}>
            For demos, show the activity feed first, then jump to outputs and the live
            preview so the judges see both process and result.
          </p>
        </div>
      </div>
    </SceneChrome>
  );
};

const SceneSix: React.FC = () => {
  return (
    <SceneChrome sceneIndex={5}>
      <div style={{display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 36, height: "100%"}}>
        <div style={{...cardStyle, padding: 42}}>
          <div style={{fontSize: 20, color: palette.red, textTransform: "uppercase", letterSpacing: 3}}>
            README explained
          </div>
          <h2 style={{fontSize: 58, margin: "18px 0 0", fontWeight: 800}}>The whole repo in 5 points</h2>
          <div style={{marginTop: 28}}>
            <BulletList
              items={[
                "Frontend: React + TanStack + Vercel",
                "Backend: FastAPI orchestrator",
                "Agents: CEO, Product, Engineer, Marketing, Finance, Critic",
                "AMD path: connect the backend to AMD-hosted model inference",
                "Production env: set VITE_API_BASE_URL and USE_MOCK=false",
              ]}
              activeIndex={4}
            />
          </div>
        </div>
        <FauxWindow title="Hand-off Checklist" subtitle="What to remember when shipping" accent={palette.green}>
          <div style={{display: "flex", flexDirection: "column", gap: 16}}>
            {[
              "Keep the frontend on Vercel",
              "Host the FastAPI backend separately",
              "Point the backend at AMD model APIs",
              "Redeploy after env vars change",
            ].map((item) => (
              <div
                key={item}
                style={{
                  padding: "18px 20px",
                  borderRadius: 18,
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${palette.border}`,
                  fontSize: 24,
                  color: palette.text,
                }}
              >
                {item}
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 10,
              padding: 24,
              borderRadius: 22,
              background: "rgba(60,255,122,0.08)",
              border: "1px solid rgba(60,255,122,0.35)",
            }}
          >
            <div style={{fontSize: 26, fontWeight: 800, color: palette.green}}>
              Final message
            </div>
            <div style={{fontSize: 24, color: palette.text, marginTop: 10, lineHeight: 1.4}}>
              The site is ready for demo use now, and it gets even stronger once the AMD
              backend URL is connected.
            </div>
          </div>
        </FauxWindow>
      </div>
    </SceneChrome>
  );
};

export const AutonomousStartupTutorial: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={sceneDurations[0]}>
        <SceneOne />
      </Sequence>
      <Sequence from={150} durationInFrames={sceneDurations[1]}>
        <SceneTwo />
      </Sequence>
      <Sequence from={300} durationInFrames={sceneDurations[2]}>
        <SceneThree />
      </Sequence>
      <Sequence from={450} durationInFrames={sceneDurations[3]}>
        <SceneFour />
      </Sequence>
      <Sequence from={600} durationInFrames={sceneDurations[4]}>
        <SceneFive />
      </Sequence>
      <Sequence from={750} durationInFrames={sceneDurations[5]}>
        <SceneSix />
      </Sequence>
    </AbsoluteFill>
  );
};
