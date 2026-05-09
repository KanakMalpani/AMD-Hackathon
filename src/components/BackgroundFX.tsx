type Intensity = "strong" | "default" | "subtle";

export function BackgroundFX({ intensity = "default" }: { intensity?: Intensity }) {
  const glowOpacity =
    intensity === "strong" ? 1 : intensity === "subtle" ? 0.55 : 0.8;
  const gridOpacity =
    intensity === "strong" ? 0.09 : intensity === "subtle" ? 0.04 : 0.06;
  const grainOpacity =
    intensity === "strong" ? 0.07 : intensity === "subtle" ? 0.03 : 0.05;

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-app-base"
      aria-hidden
    >
      {/* Atmospheric glows + slow drift */}
      <div
        className="absolute inset-0 bg-app-glow animate-bg-drift"
        style={{ opacity: glowOpacity }}
      />
      {/* Faint grid */}
      <div
        className="absolute inset-0 bg-grid"
        style={{ opacity: gridOpacity }}
      />
      {/* Paper grain */}
      <div
        className="absolute inset-0 bg-grain"
        style={{ opacity: grainOpacity }}
      />
      {/* Vignette for depth */}
      <div className="absolute inset-0 bg-app-vignette" />
    </div>
  );
}
