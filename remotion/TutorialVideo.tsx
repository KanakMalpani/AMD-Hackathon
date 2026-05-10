import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const palette = {
  bg: "#030303",
  card: "rgba(255,255,255,0.045)",
  border: "rgba(255,255,255,0.12)",
  red: "#ED1C24",
  redSoft: "rgba(237,28,36,0.15)",
  green: "#3CFF7A",
  greenSoft: "rgba(60,255,122,0.13)",
  white: "#FAFAFA",
  muted: "#A1A1AA",
};

const sceneDurations = [360, 360, 600, 480, 540, 360] as const;
const totalDuration = sceneDurations.reduce((sum, value) => sum + value, 0);

const scenes = [
  {
    kicker: "LIVE DEMO / HOOK",
    title: "Execution, not just text.",
    subtitle:
      "LaunchMyIdea AI shows how AMD-backed agents can take a startup idea and turn it into an executable company plan.",
  },
  {
    kicker: "LIVE DEMO / INPUT",
    title: "One idea starts everything.",
    subtitle:
      "The user enters a startup concept, and the system spins up a visible simulation instead of hiding the process.",
  },
  {
    kicker: "LIVE DEMO / DRAG RACE",
    title: "The Hardware Drag Race",
    subtitle:
      "A standard CPU lane crawls, while the AMD Instinct and ROCm lane moves through the simulation in parallel.",
  },
  {
    kicker: "LIVE DEMO / COLLABORATION",
    title: "Six agents, one startup.",
    subtitle:
      "CEO, Product, Engineer, Marketing, Finance, and Critic collaborate in real time across strategy, build, and launch.",
  },
  {
    kicker: "LIVE DEMO / GRAND REVEAL",
    title: "The plan becomes a product.",
    subtitle:
      "The Engineer agent does not stop at words. It prepares code-ready output and a live preview that makes the startup feel real.",
  },
  {
    kicker: "LIVE DEMO / CLOSE",
    title: "From what if to launch.",
    subtitle:
      "LaunchMyIdea AI turns AMD acceleration into visible business execution.",
  },
] as const;

const voiceoverFile = staticFile("voiceover/launchmyidea-ai-tutorial.mp3");

const mono = "'Space Mono', Consolas, monospace";
const display = "'Bahnschrift', 'Aptos Display', 'Segoe UI', sans-serif";

const sceneCard: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.025))",
  border: `1px solid ${palette.border}`,
  borderRadius: 30,
  boxShadow: "0 28px 80px rgba(0,0,0,0.42)",
};

const sumBefore = (index: number) =>
  sceneDurations.slice(0, index).reduce((sum, value) => sum + value, 0);

const SceneShell: React.FC<{
  index: number;
  children: React.ReactNode;
}> = ({ index, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const intro = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 120 },
  });

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(circle at 14% 18%, rgba(237,28,36,0.26), transparent 24%),
          radial-gradient(circle at 86% 76%, rgba(60,255,122,0.11), transparent 24%),
          linear-gradient(180deg, #09090b 0%, #020202 100%)
        `,
        color: palette.white,
        fontFamily: display,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          opacity: 0.35,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: 9999,
          border: "1px solid rgba(237,28,36,0.18)",
          top: -280,
          right: -180,
          opacity: 0.45,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 520,
          height: 520,
          borderRadius: 9999,
          border: "1px solid rgba(255,255,255,0.08)",
          bottom: -150,
          left: -130,
          opacity: 0.35,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "58px 72px 52px",
          transform: `translateY(${interpolate(intro, [0, 1], [24, 0])}px)`,
          opacity: intro,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div
              style={{
                fontFamily: mono,
                fontSize: 17,
                letterSpacing: 5,
                textTransform: "uppercase",
                color: palette.red,
              }}
            >
              {scenes[index].kicker}
            </div>
            <div style={{ marginTop: 14, fontSize: 74, fontWeight: 800, lineHeight: 0.94 }}>
              {scenes[index].title}
            </div>
            <div
              style={{
                marginTop: 16,
                maxWidth: 980,
                fontSize: 28,
                lineHeight: 1.34,
                color: palette.muted,
              }}
            >
              {scenes[index].subtitle}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {scenes.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === index ? 58 : 12,
                  height: 12,
                  borderRadius: 999,
                  background:
                    i === index
                      ? "linear-gradient(90deg,#ED1C24 0%,#FF7A7A 60%,#FFFFFF 100%)"
                      : "rgba(255,255,255,0.16)",
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", width: "100%", height: "100%", marginTop: 34 }}>
          {children}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 24,
            fontFamily: mono,
            fontSize: 16,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: palette.muted,
          }}
        >
          <div>LaunchMyIdea AI</div>
          <div>90 second live demo story</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const MetricPill: React.FC<{ label: string; value: string; accent?: string }> = ({
  label,
  value,
  accent = palette.red,
}) => (
  <div
    style={{
      ...sceneCard,
      minWidth: 220,
      padding: "18px 22px",
      background: "rgba(255,255,255,0.035)",
    }}
  >
    <div style={{ fontFamily: mono, fontSize: 14, color: palette.muted, letterSpacing: 2 }}>
      {label}
    </div>
    <div style={{ fontSize: 34, fontWeight: 700, marginTop: 12, color: accent }}>{value}</div>
  </div>
);

const SceneOne: React.FC = () => {
  const frame = useCurrentFrame();
  const shimmer = interpolate(frame, [0, sceneDurations[0]], [-260, 520], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneShell index={0}>
      <div style={{ display: "flex", width: "100%", gap: 28 }}>
        <div
          style={{
            ...sceneCard,
            flex: 1.1,
            padding: "42px 44px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: -120,
              background:
                "conic-gradient(from 95deg, transparent, rgba(237,28,36,0.18), transparent 42%, rgba(255,255,255,0.10), transparent 65%)",
              transform: `rotate(${frame * 0.35}deg)`,
            }}
          />
          <div style={{ position: "relative", zIndex: 2 }}>
            <div
              style={{
                display: "inline-flex",
                padding: "10px 14px",
                borderRadius: 999,
                background: palette.redSoft,
                border: "1px solid rgba(237,28,36,0.35)",
                fontFamily: mono,
                fontSize: 14,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              AMD Edition
            </div>
            <div style={{ marginTop: 28, fontSize: 128, fontWeight: 900, lineHeight: 0.84 }}>
              IDEA
            </div>
            <div
              style={{
                marginTop: 18,
                maxWidth: 780,
                fontSize: 27,
                color: palette.muted,
                lineHeight: 1.44,
              }}
            >
              We have all seen AI generate text. This project is about execution. One startup
              idea enters, and a full visible company simulation begins.
            </div>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 34 }}>
              <MetricPill label="Input" value="1 raw startup idea" />
              <MetricPill label="Runtime" value="Visible multi-agent flow" accent={palette.green} />
              <MetricPill label="Outcome" value="Execution plan" accent="#FFFFFF" />
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              top: -80,
              left: shimmer,
              width: 200,
              height: "135%",
              transform: "rotate(18deg)",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
            }}
          />
        </div>

        <div style={{ width: 520, display: "flex", flexDirection: "column", gap: 18 }}>
          {[
            "Validation",
            "Product Breakdown",
            "MVP Scope",
            "Marketing Strategy",
            "Revenue Simulation",
            "Live Preview",
          ].map((item, index) => (
            <div
              key={item}
              style={{
                ...sceneCard,
                padding: "18px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transform: `translateX(${Math.sin((frame + index * 7) / 16) * 8}px)`,
              }}
            >
              <div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{item}</div>
                <div style={{ marginTop: 6, fontFamily: mono, fontSize: 14, color: palette.muted }}>
                  generated by specialized agents
                </div>
              </div>
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: index % 2 === 0 ? palette.red : palette.green,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </SceneShell>
  );
};

const SceneTwo: React.FC = () => {
  const frame = useCurrentFrame();
  const exampleIdea = "A solar-powered autonomous lawn-mowing subscription service";
  const typed = Math.max(
    0,
    Math.min(exampleIdea.length, Math.floor(interpolate(frame, [24, 250], [0, exampleIdea.length]))),
  );
  const buttonGlow = 0.55 + Math.sin(frame / 12) * 0.08;

  return (
    <SceneShell index={1}>
      <div style={{ display: "flex", width: "100%", gap: 28 }}>
        <div style={{ ...sceneCard, flex: 1, padding: "34px 36px" }}>
          <div style={{ fontFamily: mono, fontSize: 16, color: palette.muted, letterSpacing: 2 }}>
            dashboard input
          </div>
          <div
            style={{
              marginTop: 20,
              ...sceneCard,
              padding: "20px 22px",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700 }}>New Startup</div>
            <div style={{ marginTop: 18, fontSize: 15, color: palette.muted, fontFamily: mono }}>
              startup idea
            </div>
            <div
              style={{
                marginTop: 10,
                minHeight: 116,
                borderRadius: 20,
                border: `1px solid ${palette.border}`,
                padding: "18px 20px",
                fontSize: 26,
                lineHeight: 1.35,
                background: "rgba(255,255,255,0.03)",
              }}
            >
              {exampleIdea.slice(0, typed)}
              <span style={{ opacity: typed < exampleIdea.length ? 1 : 0.4 }}>|</span>
            </div>
            <div
              style={{
                marginTop: 24,
                display: "inline-flex",
                padding: "18px 28px",
                borderRadius: 999,
                background: palette.red,
                color: palette.white,
                fontSize: 24,
                fontWeight: 700,
                boxShadow: `0 0 34px rgba(237,28,36,${buttonGlow})`,
              }}
            >
              Start Simulation
            </div>
          </div>
        </div>

        <div style={{ width: 520, display: "flex", flexDirection: "column", gap: 18 }}>
          {[
            "User opens the startup modal",
            "A creative idea is entered",
            "The orchestrator receives the prompt",
            "The simulation becomes visible immediately",
          ].map((line, index) => (
            <div key={line} style={{ ...sceneCard, padding: "22px 24px" }}>
              <div style={{ fontFamily: mono, fontSize: 13, color: palette.red, letterSpacing: 2 }}>
                step {index + 1}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, marginTop: 10 }}>{line}</div>
            </div>
          ))}
        </div>
      </div>
    </SceneShell>
  );
};

const SceneThree: React.FC = () => {
  const frame = useCurrentFrame();
  const cpuProgress = Math.min(34, frame * 0.08);
  const amdProgress = Math.min(100, frame * 0.36);
  const amdStage = amdProgress < 18 ? "Initializing" : amdProgress < 42 ? "Strategy" : amdProgress < 66 ? "Parallel Agent Work" : amdProgress < 88 ? "MVP + Finance" : "Grand Reveal";
  const cpuStage = cpuProgress < 14 ? "Initializing" : cpuProgress < 24 ? "Strategy" : "Still processing";

  return (
    <SceneShell index={2}>
      <div style={{ display: "flex", width: "100%", gap: 28 }}>
        <div style={{ ...sceneCard, flex: 1, padding: "34px 38px" }}>
          <div style={{ fontFamily: mono, fontSize: 16, color: palette.muted, letterSpacing: 2 }}>
            split-screen benchmark
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 34, marginTop: 24 }}>
            {[
              {
                label: "Standard Cloud CPU",
                stage: cpuStage,
                pct: cpuProgress,
                bg: "rgba(255,255,255,0.05)",
                accent: "#9A9AA2",
                border: "rgba(255,255,255,0.14)",
              },
              {
                label: "AMD Instinct / ROCm",
                stage: amdStage,
                pct: amdProgress,
                bg: "rgba(237,28,36,0.09)",
                accent: palette.red,
                border: "rgba(237,28,36,0.38)",
              },
            ].map((lane) => (
              <div key={lane.label}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>{lane.label}</div>
                    <div style={{ fontFamily: mono, fontSize: 14, color: palette.muted, marginTop: 6 }}>
                      {lane.stage}
                    </div>
                  </div>
                  <div style={{ fontFamily: mono, fontSize: 24 }}>{Math.round(lane.pct)}%</div>
                </div>
                <div
                  style={{
                    height: 106,
                    borderRadius: 30,
                    background: lane.bg,
                    border: `1px solid ${lane.border}`,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: `${lane.pct}%`,
                      background:
                        lane.label === "Standard Cloud CPU"
                          ? "linear-gradient(90deg, rgba(255,255,255,0.20), rgba(255,255,255,0.08))"
                          : "linear-gradient(90deg, rgba(237,28,36,0.58), rgba(255,122,122,0.35))",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: `calc(${lane.pct}% - 28px)`,
                      top: 33,
                      width: 42,
                      height: 42,
                      borderRadius: 999,
                      background: lane.accent,
                      boxShadow:
                        lane.label === "Standard Cloud CPU"
                          ? "0 0 24px rgba(255,255,255,0.18)"
                          : "0 0 28px rgba(237,28,36,0.42)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ width: 430, display: "flex", flexDirection: "column", gap: 18 }}>
          <MetricPill label="Concurrency" value="6 agents live" accent={palette.green} />
          <MetricPill label="Serving stack" value="ROCm + vLLM" accent="#FFFFFF" />
          <div style={{ ...sceneCard, padding: "24px 26px", flex: 1 }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>Why this section matters</div>
            <div style={{ marginTop: 16, fontSize: 22, color: palette.muted, lineHeight: 1.5 }}>
              This is where the demo proves the hardware story. The CPU lane is still trying to
              initialize while the AMD lane is already coordinating specialist agents in parallel.
            </div>
          </div>
        </div>
      </div>
    </SceneShell>
  );
};

const SceneFour: React.FC = () => {
  const frame = useCurrentFrame();
  const feed = [
    "CEO Agent: framing the startup thesis and wedge.",
    "Product Agent: locking the MVP scope and user journey.",
    "Engineer Agent: scaffolding tech stack and component plan.",
    "Marketing Agent: drafting the launch story and hook lines.",
    "Finance Agent: projecting revenue model and costs.",
    "Critic Agent: attacking weak assumptions before launch.",
  ];
  const visible = Math.min(feed.length, Math.floor(interpolate(frame, [40, 360], [1, feed.length])));
  const nodes = [
    { name: "CEO", x: 260, y: 250 },
    { name: "Product", x: 520, y: 110 },
    { name: "Engineer", x: 820, y: 110 },
    { name: "Marketing", x: 1100, y: 250 },
    { name: "Finance", x: 820, y: 390 },
    { name: "Critic", x: 520, y: 390 },
  ] as const;
  const center = { x: 680, y: 250 };

  return (
    <SceneShell index={3}>
      <div style={{ display: "flex", width: "100%", gap: 28 }}>
        <div style={{ ...sceneCard, flex: 1, padding: 28, position: "relative", overflow: "hidden" }}>
          <svg width="100%" height="100%" viewBox="0 0 1360 520">
            {nodes.map((node, index) => (
              <line
                key={node.name}
                x1={center.x}
                y1={center.y}
                x2={node.x}
                y2={node.y}
                stroke={index % 2 === 0 ? "rgba(237,28,36,0.32)" : "rgba(60,255,122,0.22)"}
                strokeWidth="3"
              />
            ))}
            {nodes.map((node, index) => {
              const t = (frame * 0.02 + index * 0.13) % 1;
              const px = center.x + (node.x - center.x) * t;
              const py = center.y + (node.y - center.y) * t;
              return <circle key={`pulse-${node.name}`} cx={px} cy={py} r={7} fill={palette.red} />;
            })}
          </svg>

          <div
            style={{
              position: "absolute",
              left: center.x - 138,
              top: center.y - 82,
              width: 276,
              height: 164,
              borderRadius: 999,
              border: "1px solid rgba(237,28,36,0.42)",
              background: "radial-gradient(circle, rgba(237,28,36,0.20), rgba(255,255,255,0.04))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              boxShadow: "0 0 48px rgba(237,28,36,0.18)",
            }}
          >
            <div>
              <div style={{ fontFamily: mono, fontSize: 14, color: palette.muted, letterSpacing: 2 }}>
                orchestrator
              </div>
              <div style={{ marginTop: 10, fontSize: 34, fontWeight: 800 }}>Command Layer</div>
            </div>
          </div>

          {nodes.map((node, index) => (
            <div
              key={node.name}
              style={{
                position: "absolute",
                left: node.x - 105,
                top: node.y - 52,
                width: 210,
                height: 104,
                borderRadius: 24,
                border: `1px solid ${index < visible ? "rgba(60,255,122,0.34)" : palette.border}`,
                background: index < visible ? palette.greenSoft : palette.card,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 700 }}>{node.name}</div>
                <div style={{ fontFamily: mono, fontSize: 13, marginTop: 8, color: palette.muted }}>
                  active agent
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ width: 470, display: "flex", flexDirection: "column", gap: 14 }}>
          {feed.slice(0, visible).map((line, index) => (
            <div
              key={line}
              style={{
                ...sceneCard,
                padding: "18px 20px",
                background: index === visible - 1 ? "rgba(237,28,36,0.12)" : "rgba(255,255,255,0.04)",
              }}
            >
              <div style={{ fontSize: 22, lineHeight: 1.38 }}>{line}</div>
            </div>
          ))}
        </div>
      </div>
    </SceneShell>
  );
};

const SceneFive: React.FC = () => {
  const frame = useCurrentFrame();
  const reveal = Math.min(100, frame * 0.22);

  return (
    <SceneShell index={4}>
      <div style={{ display: "flex", width: "100%", gap: 28 }}>
        <div style={{ ...sceneCard, flex: 1.1, padding: "30px 32px" }}>
          <div style={{ fontFamily: mono, fontSize: 16, color: palette.muted, letterSpacing: 2 }}>
            live preview tab
          </div>
          <div
            style={{
              marginTop: 18,
              borderRadius: 28,
              border: `1px solid rgba(60,255,122,0.28)`,
              background:
                "linear-gradient(135deg, rgba(237,28,36,0.12), rgba(7,7,8,0.96) 45%, rgba(60,255,122,0.12))",
              height: 470,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div style={{ padding: "30px 34px" }}>
              <div
                style={{
                  display: "inline-flex",
                  padding: "10px 14px",
                  borderRadius: 999,
                  background: "rgba(60,255,122,0.10)",
                  border: "1px solid rgba(60,255,122,0.30)",
                  fontFamily: mono,
                  fontSize: 13,
                  letterSpacing: 2,
                }}
              >
                generated landing page
              </div>
              <div style={{ marginTop: 26, fontSize: 64, fontWeight: 900, lineHeight: 0.94 }}>
                Solar-powered mowing
                <br />
                as a subscription.
              </div>
              <div style={{ marginTop: 18, fontSize: 24, lineHeight: 1.44, color: palette.muted, maxWidth: 760 }}>
                A live preview rendered from the Engineer agent’s output. From idea to functional
                startup surface in one continuous flow.
              </div>
              <div style={{ display: "flex", gap: 14, marginTop: 28, flexWrap: "wrap" }}>
                {["Book a demo", "See pricing", "Why solar wins"].map((item) => (
                  <div
                    key={item}
                    style={{
                      padding: "16px 20px",
                      borderRadius: 999,
                      background: item === "Book a demo" ? palette.red : "rgba(255,255,255,0.08)",
                      fontSize: 20,
                      fontWeight: 700,
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                height: 6,
                width: `${reveal}%`,
                background: "linear-gradient(90deg,#ED1C24,#3CFF7A)",
              }}
            />
          </div>
        </div>

        <div style={{ width: 430, display: "flex", flexDirection: "column", gap: 18 }}>
          {[
            "The Engineer agent converts plan into code-ready output.",
            "The preview becomes the visual proof that the system can execute.",
            "Judges see something concrete, not just a generated paragraph.",
          ].map((line, index) => (
            <div key={line} style={{ ...sceneCard, padding: "22px 24px" }}>
              <div style={{ fontFamily: mono, fontSize: 13, color: index === 0 ? palette.red : palette.green, letterSpacing: 2 }}>
                reveal point {index + 1}
              </div>
              <div style={{ marginTop: 10, fontSize: 25, lineHeight: 1.4 }}>{line}</div>
            </div>
          ))}
        </div>
      </div>
    </SceneShell>
  );
};

const SceneSix: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame / 10) * 0.018;

  return (
    <SceneShell index={5}>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            ...sceneCard,
            width: 1320,
            padding: "56px 66px",
            transform: `scale(${pulse})`,
            background:
              "radial-gradient(circle at top, rgba(237,28,36,0.18), rgba(255,255,255,0.03) 48%, rgba(255,255,255,0.02))",
          }}
        >
          <div style={{ fontFamily: mono, fontSize: 16, color: palette.red, letterSpacing: 3 }}>
            final line
          </div>
          <div style={{ marginTop: 20, fontSize: 118, fontWeight: 900, lineHeight: 0.86, letterSpacing: -4 }}>
            LaunchMyIdea AI
          </div>
          <div style={{ marginTop: 28, fontSize: 34, lineHeight: 1.32 }}>
            Most systems give you words.
            <br />
            This gives you execution.
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", marginTop: 34 }}>
            {["FastAPI orchestrator", "Agent swarm", "AMD acceleration", "Live product preview"].map(
              (item, index) => (
                <div
                  key={item}
                  style={{
                    padding: "14px 18px",
                    borderRadius: 999,
                    background: index === 2 ? palette.redSoft : "rgba(255,255,255,0.04)",
                    border: `1px solid ${index === 2 ? "rgba(237,28,36,0.36)" : palette.border}`,
                    fontFamily: mono,
                    fontSize: 15,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                  }}
                >
                  {item}
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </SceneShell>
  );
};

export const LaunchMyIdeaAITutorial: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={voiceoverFile} />
      <Sequence from={sumBefore(0)} durationInFrames={sceneDurations[0]}>
        <SceneOne />
      </Sequence>
      <Sequence from={sumBefore(1)} durationInFrames={sceneDurations[1]}>
        <SceneTwo />
      </Sequence>
      <Sequence from={sumBefore(2)} durationInFrames={sceneDurations[2]}>
        <SceneThree />
      </Sequence>
      <Sequence from={sumBefore(3)} durationInFrames={sceneDurations[3]}>
        <SceneFour />
      </Sequence>
      <Sequence from={sumBefore(4)} durationInFrames={sceneDurations[4]}>
        <SceneFive />
      </Sequence>
      <Sequence from={sumBefore(5)} durationInFrames={sceneDurations[5]}>
        <SceneSix />
      </Sequence>
    </AbsoluteFill>
  );
};

export const launchMyIdeaDurationInFrames = totalDuration;
