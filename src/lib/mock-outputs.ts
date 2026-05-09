import type { Project } from "./app-store";

export type ProjectType = "student" | "fitness" | "creator" | "general";

export function getProjectType(idea: string): ProjectType {
  const i = (idea || "").toLowerCase();
  if (/(student|study|school|exam|learning|education|campus|college|university)/.test(i)) return "student";
  if (/(fitness|workout|gym|health|diet|exercise|trainer|nutrition)/.test(i)) return "fitness";
  if (/(creator|content|influencer|youtube|reels|tiktok|podcast|newsletter)/.test(i)) return "creator";
  return "general";
}

export type Persona = {
  audience: string;
  channels: { name: string; effort: "Low" | "Medium" | "High"; impact: "Low" | "Medium" | "High"; firstAction: string }[];
};

export function personaFor(idea: string): Persona {
  const t = getProjectType(idea);
  if (t === "student") {
    return {
      audience: "Students preparing for exams and managing study plans (15–24).",
      channels: [
        { name: "Discord study servers", effort: "Low", impact: "High", firstAction: "Drop a build-log in 5 student servers." },
        { name: "YouTube Shorts", effort: "Medium", impact: "High", firstAction: "Post a 30s study-routine demo." },
        { name: "Telegram student groups", effort: "Low", impact: "Medium", firstAction: "Share a free planner template in 10 groups." },
        { name: "Campus communities", effort: "Medium", impact: "High", firstAction: "Recruit 10 campus reps with free access." },
      ],
    };
  }
  if (t === "fitness") {
    return {
      audience: "Beginners and gym users who need personalized workout guidance (20–35).",
      channels: [
        { name: "Instagram Reels", effort: "Medium", impact: "High", firstAction: "Post a 15s transformation hook." },
        { name: "Fitness influencers", effort: "High", impact: "High", firstAction: "DM 25 mid-tier coaches with a free demo." },
        { name: "Gym communities", effort: "Medium", impact: "Medium", firstAction: "Pin a flyer in 5 local gyms." },
        { name: "WhatsApp fitness groups", effort: "Low", impact: "Medium", firstAction: "Seed 10 local fitness groups." },
      ],
    };
  }
  if (t === "creator") {
    return {
      audience: "Content creators who need help planning, writing, and scheduling content.",
      channels: [
        { name: "X / Twitter", effort: "Low", impact: "High", firstAction: "Post a daily build-in-public thread." },
        { name: "YouTube long-form", effort: "High", impact: "High", firstAction: "Ship a 'build with me' video." },
        { name: "Creator communities", effort: "Low", impact: "Medium", firstAction: "Share template in 3 creator Discords." },
        { name: "LinkedIn creators", effort: "Medium", impact: "Medium", firstAction: "Pitch 10 creator newsletters." },
      ],
    };
  }
  return {
    audience: "Young builders, small teams, and early-stage founders.",
    channels: [
      { name: "Communities", effort: "Low", impact: "High", firstAction: "Share a 'lessons learned' post in 5 communities." },
      { name: "Short-form content", effort: "Medium", impact: "High", firstAction: "Post 3 short videos this week." },
      { name: "Cold outreach", effort: "Medium", impact: "Medium", firstAction: "DM 50 ideal users this week." },
      { name: "Product Hunt", effort: "High", impact: "High", firstAction: "Schedule a launch in 2 weeks." },
    ],
  };
}

export type OutputData = {
  validation: {
    problemStrength: number;
    targetUser: string;
    marketRisk: string;
    competitors: string[];
    differentiation: string;
    score: number;
  };
  mvp: {
    coreFeatures: string[];
    mustHave: string[];
    niceToHave: string[];
    userFlow: string[];
    firstVersion: string;
  };
  landing: {
    headline: string;
    subheading: string;
    cta: string;
    bullets: string[];
  };
  code: {
    stack: string[];
    folders: string[];
    routes: string[];
    schema: string[];
    components: string[];
  };
  marketing: {
    icp: string;
    channels: string[];
    posts: string[];
    outreach: string;
  };
  growth: {
    months: { label: string; users: number; usersLabel: string }[];
    summary: string;
  };
  critic: {
    weakest: string;
    risk: string;
    fail: string;
    fix: string;
    improved: string;
  };
  breakdown: {
    problem: number;
    market: number;
    mvp: number;
    differentiation: number;
    revenue: number;
    execution: number;
  };
};

const TYPE_DATA: Record<ProjectType, {
  competitors: string[];
  mvp: { core: string[]; must: string[]; nice: string[]; flow: string[]; firstVersion: string };
  landingBullets: string[];
  posts: (title: string) => string[];
  outreach: (title: string) => string;
  growth: { label: string; users: number; usersLabel: string }[];
  critic: { weakest: string; risk: string; fail: string; fix: string; improved: (title: string) => string };
  breakdown: OutputData["breakdown"];
  agentLines: { agent: string; text: string; done?: boolean }[];
}> = {
  student: {
    competitors: ["Notion templates", "Quizlet", "Generic AI chatbots", "Paper planners"],
    mvp: {
      core: ["AI study planner", "Daily task breakdown", "Progress tracker", "Reminder system", "Weak-topic detection"],
      must: ["Idea input → study plan", "Daily checklist", "Progress streaks"],
      nice: ["Group study mode", "Pomodoro timer", "Parent/teacher view"],
      flow: ["Sign up", "Enter syllabus", "Generate plan", "Daily check-in", "Track progress"],
      firstVersion: "Single-student web app, mocked AI plan generator, 1 export format.",
    },
    landingBullets: [
      "AI plans your day around exams",
      "Spot weak topics before they hurt your score",
      "Streaks, reminders, and gentle accountability",
      "Built by students, for students",
    ],
    posts: (title) => [
      `${title} just made my study week 10x calmer 📚`,
      `Stop staring at a blank planner. ${title} writes the week for you.`,
      `Built ${title} for students who hate Notion templates 🎯`,
    ],
    outreach: (title) => `Hey — saw you posted about exam stress. Built ${title} to plan study weeks in 30 seconds. Free for students — want to try it?`,
    growth: [
      { label: "M1", users: 80, usersLabel: "80" },
      { label: "M2", users: 220, usersLabel: "220" },
      { label: "M3", users: 520, usersLabel: "520" },
      { label: "M4", users: 900, usersLabel: "900" },
      { label: "M5", users: 1400, usersLabel: "1.4K" },
      { label: "M6", users: 2100, usersLabel: "2.1K" },
    ],
    critic: {
      weakest: "Students may avoid tools that feel like extra work.",
      risk: "Low retention after first week if checklist feels heavy.",
      fail: "Without daily reminders + streaks, the planner gets abandoned.",
      fix: "Add lightweight Telegram/WhatsApp reminders + visible streaks.",
      improved: (title) => `${title} v2: 30-second daily check-in over WhatsApp → streaks + weak-topic alerts.`,
    },
    breakdown: { problem: 88, market: 80, mvp: 86, differentiation: 70, revenue: 62, execution: 84 },
    agentLines: [
      { agent: "System", text: "Simulation started for student-focused project." },
      { agent: "Strategy Engine", text: "Breaking the idea into a student-first execution plan." },
      { agent: "Insight Engine", text: "Students struggle with consistency, planning, and revision." },
      { agent: "Product Engine", text: "Focusing MVP on study plans, reminders, and progress tracking." },
      { agent: "Design Engine", text: "Drafting landing copy aimed at exam-week stress." },
      { agent: "Build Engine", text: "Stack: React + Tailwind + lightweight reminders." },
      { agent: "Launch Engine", text: "Best launch channels are Discord study servers and YouTube Shorts." },
      { agent: "Critic Engine", text: "Risk detected: students may avoid tools that feel like extra work." },
      { agent: "System", text: "Student startup world report generated.", done: true },
    ],
  },
  fitness: {
    competitors: ["MyFitnessPal", "Nike Training Club", "Generic AI chatbots", "Personal trainers"],
    mvp: {
      core: ["AI workout planner", "Diet suggestions", "Progress tracker", "Habit reminders", "Beginner fitness dashboard"],
      must: ["Personal workout plan", "Daily check-in", "Progress photos"],
      nice: ["Wearable sync", "Group challenges", "Coach marketplace"],
      flow: ["Sign up", "Goal & body baseline", "Generate plan", "Log workout", "See progress"],
      firstVersion: "Single-user web app, mocked workout generator, 1 progress dashboard.",
    },
    landingBullets: [
      "A real plan, built around your body and goals",
      "Beginner-friendly workouts with zero confusion",
      "Track strength, weight, and habits in one place",
      "Built for people who hate guesswork",
    ],
    posts: (title) => [
      `Quit the random YouTube workouts. ${title} builds a real plan 💪`,
      `${title}: your AI fitness coach for the first 90 days.`,
      `From 'I should work out' to a 4-week plan in 60 seconds. ${title}.`,
    ],
    outreach: (title) => `Hey — saw your fitness journey post. Built ${title} for beginners who don't know where to start. Want a free plan?`,
    growth: [
      { label: "M1", users: 120, usersLabel: "120" },
      { label: "M2", users: 340, usersLabel: "340" },
      { label: "M3", users: 680, usersLabel: "680" },
      { label: "M4", users: 1100, usersLabel: "1.1K" },
      { label: "M5", users: 1800, usersLabel: "1.8K" },
      { label: "M6", users: 2700, usersLabel: "2.7K" },
    ],
    critic: {
      weakest: "Fitness market is crowded; differentiation must be sharper.",
      risk: "Users churn after week 2 if plans feel generic.",
      fail: "Without before/after proof, social trust never compounds.",
      fix: "Add transformation stories and 4-week milestone celebrations.",
      improved: (title) => `${title} v2: weekly plan tweaks + shareable milestone cards → built-in social proof loop.`,
    },
    breakdown: { problem: 84, market: 70, mvp: 88, differentiation: 64, revenue: 72, execution: 82 },
    agentLines: [
      { agent: "System", text: "Simulation started for fitness-focused project." },
      { agent: "Strategy Engine", text: "Targeting beginner gym-goers with a personalized AI coach." },
      { agent: "Insight Engine", text: "Beginners struggle with consistency, workout confusion, and progress tracking." },
      { agent: "Product Engine", text: "Focusing MVP on workout plans, diet suggestions, and progress tracking." },
      { agent: "Design Engine", text: "Landing copy emphasizes beginner-friendly, no-guesswork plans." },
      { agent: "Build Engine", text: "Stack: React + Tailwind + simple workout generator." },
      { agent: "Launch Engine", text: "Best launch channels are Instagram Reels and fitness creators." },
      { agent: "Critic Engine", text: "Risk detected: fitness market is crowded, differentiation must be sharper." },
      { agent: "System", text: "Fitness startup world report generated.", done: true },
    ],
  },
  creator: {
    competitors: ["Buffer", "Notion", "ChatGPT", "Hypefury"],
    mvp: {
      core: ["Content idea generator", "Content calendar", "Hook generator", "Caption writer", "Posting workflow"],
      must: ["Idea → 7-day plan", "Hook + caption drafts", "Calendar export"],
      nice: ["Cross-posting", "Performance analytics", "Brand voice training"],
      flow: ["Sign up", "Pick niche", "Generate week", "Edit & schedule", "Track posts"],
      firstVersion: "Single-creator web app, mocked content generator, 1 calendar export.",
    },
    landingBullets: [
      "A week of content in 60 seconds",
      "Hooks that actually stop the scroll",
      "Captions that match your voice",
      "Built for creators who'd rather create than plan",
    ],
    posts: (title) => [
      `${title} planned my whole week of content while I made coffee ☕`,
      `Stop staring at a blank Notion page. ${title} writes the week for you.`,
      `From 'no idea what to post' to a 7-day calendar. ${title}.`,
    ],
    outreach: (title) => `Hey — love your content. Built ${title} to take content planning off creators' plates. Free week if you want to try it.`,
    growth: [
      { label: "M1", users: 150, usersLabel: "150" },
      { label: "M2", users: 420, usersLabel: "420" },
      { label: "M3", users: 900, usersLabel: "900" },
      { label: "M4", users: 1600, usersLabel: "1.6K" },
      { label: "M5", users: 2500, usersLabel: "2.5K" },
      { label: "M6", users: 4000, usersLabel: "4K" },
    ],
    critic: {
      weakest: "Creators already use many tools; positioning must be sharper.",
      risk: "Tool fatigue — creators won't switch unless time-savings are obvious.",
      fail: "Without one wow-feature, it blends into Notion + ChatGPT.",
      fix: "Lead with hook generator → most painful task, fastest demo.",
      improved: (title) => `${title} v2: hook generator as the entry product, calendar as the upgrade path.`,
    },
    breakdown: { problem: 82, market: 76, mvp: 84, differentiation: 66, revenue: 74, execution: 80 },
    agentLines: [
      { agent: "System", text: "Simulation started for creator-focused project." },
      { agent: "Strategy Engine", text: "Positioning as the AI content co-pilot for solo creators." },
      { agent: "Insight Engine", text: "Creators struggle with consistency, ideas, and distribution." },
      { agent: "Product Engine", text: "Focusing MVP on content planning and hook generation." },
      { agent: "Design Engine", text: "Landing copy: 'a week of content in 60 seconds'." },
      { agent: "Build Engine", text: "Stack: React + Tailwind + simple content generator." },
      { agent: "Launch Engine", text: "Best launch channels are creator communities and X/Twitter." },
      { agent: "Critic Engine", text: "Risk detected: creators already use many tools, positioning must be sharper." },
      { agent: "System", text: "Creator startup world report generated.", done: true },
    ],
  },
  general: {
    competitors: ["Notion AI", "ChatGPT", "Bubble", "Generic GPT wrappers"],
    mvp: {
      core: ["Idea validation", "MVP planner", "Launch checklist", "Marketing plan", "Growth calculator"],
      must: ["Idea capture", "Validation report", "Launch score"],
      nice: ["Team workspaces", "Custom personas", "Integrations"],
      flow: ["Sign up", "Enter idea", "Run simulation", "Review package", "Export & ship"],
      firstVersion: "Single-user web app, mocked agents, 1 export format.",
    },
    landingBullets: [
      "Validated problem & market",
      "Scoped MVP & user flow",
      "Drafted launch copy",
      "Critic-reviewed plan",
    ],
    posts: (title) => [
      `Just shipped ${title} — turns any idea into a launch plan in minutes 🚀`,
      `Stop drafting Notion docs. Start launching. ${title} writes the plan for you.`,
      `From 'I have an idea' to 'here's the MVP' in one click. ${title}.`,
    ],
    outreach: (title) => `Hey - saw you're building. ${title} drafts your startup world end-to-end. Want a free run-through?`,
    growth: [
      { label: "M1", users: 100, usersLabel: "100" },
      { label: "M2", users: 280, usersLabel: "280" },
      { label: "M3", users: 560, usersLabel: "560" },
      { label: "M4", users: 850, usersLabel: "850" },
      { label: "M5", users: 1300, usersLabel: "1.3K" },
      { label: "M6", users: 2000, usersLabel: "2K" },
    ],
    critic: {
      weakest: "Differentiation vs general AI chat tools.",
      risk: "Users try once, don't return without a clear job-to-be-done.",
      fail: "Without sharing/export, there is no organic loop.",
      fix: "Add public launch pages — every project becomes a sharable artifact.",
      improved: (title) => `${title} v2: every package gets a public URL + share card → built-in growth loop.`,
    },
    breakdown: { problem: 86, market: 74, mvp: 88, differentiation: 69, revenue: 70, execution: 84 },
    agentLines: [
      { agent: "System", text: "Simulation started." },
      { agent: "Strategy Engine", text: "Breaking the idea into execution tasks." },
      { agent: "Insight Engine", text: "Users need faster ways to validate, plan, and launch ideas." },
      { agent: "Product Engine", text: "Reducing MVP scope to core features." },
      { agent: "Design Engine", text: "Drafting landing page hero copy." },
      { agent: "Build Engine", text: "Creating frontend and backend structure." },
      { agent: "Launch Engine", text: "Selecting first launch channels: communities + short-form." },
      { agent: "Critic Engine", text: "Weak differentiation detected. Suggesting sharper wedge." },
      { agent: "System", text: "Startup world report ready.", done: true },
    ],
  },
};

export function agentLinesFor(idea: string) {
  return TYPE_DATA[getProjectType(idea)].agentLines;
}

export function buildOutputs(p: Project): OutputData {
  const idea = p.idea?.trim() || "your startup idea";
  const title = p.title;
  const t = getProjectType(idea);
  const data = TYPE_DATA[t];
  const persona = personaFor(idea);

  return {
    validation: {
      problemStrength: data.breakdown.problem,
      targetUser: persona.audience,
      marketRisk: data.critic.risk,
      competitors: data.competitors,
      differentiation: `${title} ships a full, critic-reviewed startup simulation built specifically for the ${t} space.`,
      score: Math.round((data.breakdown.problem + data.breakdown.market) / 2),
    },
    mvp: {
      coreFeatures: data.mvp.core,
      mustHave: data.mvp.must,
      niceToHave: data.mvp.nice,
      userFlow: data.mvp.flow,
      firstVersion: data.mvp.firstVersion,
    },
    landing: {
      headline: `${title} — built for the ${t === "general" ? "next builder" : t} space.`,
      subheading: `Turn "${idea.slice(0, 80)}" into a visible startup world in minutes.`,
      cta: "Run my startup world",
      bullets: data.landingBullets,
    },
    code: {
      stack: ["React + Vite", "TanStack Router", "Tailwind", "Framer Motion", "LocalStorage (mock)"],
      folders: ["/src/routes", "/src/components", "/src/lib", "/src/hooks"],
      routes: ["GET /api/projects", "POST /api/projects", "POST /api/simulate", "GET /api/score"],
      schema: ["users(id, email, name)", "projects(id, user_id, idea, score)", "outputs(id, project_id, kind, data)"],
      components: ["IdeaInput", "ExecutionTimeline", "OutputTabs", "ReadinessScore"],
    },
    marketing: {
      icp: persona.audience,
      channels: persona.channels.map((c) => c.name),
      posts: data.posts(title),
      outreach: data.outreach(title),
    },
    growth: {
      months: data.growth,
      summary: `Projected growth to ${data.growth[5].usersLabel} active users by month 6, driven by ${persona.channels[0].name}.`,
    },
    critic: {
      weakest: data.critic.weakest,
      risk: data.critic.risk,
      fail: data.critic.fail,
      fix: data.critic.fix,
      improved: data.critic.improved(title),
    },
    breakdown: data.breakdown,
  };
}
