import type { GrowthMonth, Project, SimulationReport, ValidationScorecard } from "./app-store";
import { buildOutputs, personaFor } from "./mock-outputs";

function fallbackBreakdown(project: Project): ValidationScorecard {
  const fallback = buildOutputs(project);
  const overall = Math.round(
    (fallback.breakdown.problem +
      fallback.breakdown.market +
      fallback.breakdown.mvp +
      fallback.breakdown.differentiation +
      fallback.breakdown.revenue +
      fallback.breakdown.execution) /
      6,
  );
  return { ...fallback.breakdown, overall };
}

export function getBreakdown(project: Project): ValidationScorecard {
  return project.simulationReport?.validation_scorecard ?? fallbackBreakdown(project);
}

export function getGrowthProjection(project: Project): { months: GrowthMonth[]; summary: string } {
  return project.simulationReport?.growth_projection ?? buildOutputs(project).growth;
}

export function getCompetitors(project: Project): string[] {
  return project.simulationReport?.outputs.validation.competitors ?? buildOutputs(project).validation.competitors;
}

export function getTargetAudience(project: Project): string {
  return project.simulationReport?.research.target_user ?? personaFor(project.idea).audience;
}

export function getBestChannel(project: Project): string {
  return (
    project.simulationReport?.outputs.marketing.best_channel ||
    project.simulationReport?.outputs.marketing.channels[0] ||
    personaFor(project.idea).channels[0]?.name ||
    "Founder communities"
  );
}

export function getRiskBars(project: Project) {
  const breakdown = getBreakdown(project);
  return [
    { label: "Market risk", value: Math.max(12, 100 - breakdown.market) },
    { label: "Build risk", value: Math.max(10, 100 - breakdown.mvp) },
    { label: "Competition risk", value: Math.max(14, 100 - breakdown.differentiation) },
    { label: "Monetization risk", value: Math.max(12, 100 - breakdown.revenue) },
    { label: "Execution risk", value: Math.max(10, 100 - breakdown.execution) },
  ];
}

export function getEffortBars(project: Project) {
  const report = project.simulationReport;
  const featureCount = report?.outputs.product.mvp_features.length ?? buildOutputs(project).mvp.coreFeatures.length;
  const architectureCount = report?.outputs.engineering.architecture.length ?? buildOutputs(project).code.folders.length;
  const channelCount = report?.outputs.marketing.channels.length ?? buildOutputs(project).marketing.channels.length;
  return [
    { label: "Build effort", value: Math.min(88, 36 + featureCount * 8) },
    { label: "Design effort", value: Math.min(78, 28 + Math.max(3, featureCount) * 5) },
    { label: "Marketing effort", value: Math.min(90, 34 + channelCount * 9) },
    { label: "Maintenance", value: Math.min(72, 22 + architectureCount * 6) },
    { label: "Launch prep", value: Math.min(82, 30 + channelCount * 7) },
  ];
}

export function getAssumptions(project: Project) {
  const report = project.simulationReport;
  const growth = getGrowthProjection(project);
  const breakdown = getBreakdown(project);
  return [
    ["Expected user adoption", growth.summary],
    ["Build complexity", report?.outputs.engineering.architecture[0] ?? "Medium (solo-friendly)"],
    ["Distribution difficulty", getBestChannel(project)],
    ["User retention risk", breakdown.differentiation < 70 ? "Medium" : "Low"],
    ["Monetization signal", report?.research.monetization_signals[0] ?? "Subscription-led validation"],
  ] as const;
}

export function getResearchSources(report?: SimulationReport) {
  return report?.research.sources ?? [];
}

export function getSourceCopy(report?: SimulationReport): string {
  const sources = getResearchSources(report);
  if (sources.length === 0) return "";
  return sources
    .map((source) => `${source.title}\n${source.url}\n${source.note}`)
    .join("\n\n");
}
