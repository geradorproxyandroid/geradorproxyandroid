export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const iconSize = size === "sm" ? 36 : size === "lg" ? 56 : 44;
  const textClass = size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-2xl";
  const bgStyle = {
    width: iconSize,
    height: iconSize,
    borderRadius: "14%",
    background: "linear-gradient(135deg, #7B2FF7 0%, #F107A3 100%)",
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    flexShrink: 0 as const,
    color: "white",
    fontWeight: 900,
    fontSize: Math.round(iconSize * 0.5),
    fontFamily: "Inter, sans-serif",
  };
  return (
    <div className="flex items-center gap-3">
      <div style={bgStyle}>S</div>
      <div>
        <div className={`font-extrabold leading-tight ${textClass} text-gradient`}>
          SHADOW<br />OFICIAL
        </div>
      </div>
    </div>
  );
}
