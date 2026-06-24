export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const iconSize = size === "sm" ? 36 : size === "lg" ? 56 : 44;
  const textClass = size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-2xl";
  const fontSize = Math.round(iconSize * 0.68);

  return (
    <div className="flex items-center gap-3">
      <div
        style={{
          width: iconSize,
          height: iconSize,
          borderRadius: "22%",
          background: "linear-gradient(135deg, #2563EB 0%, #10B981 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            color: "white",
            fontWeight: 900,
            fontSize: fontSize,
            fontFamily: "Arial Black, Arial, sans-serif",
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          S
        </span>
      </div>

      <div>
        <div className={`font-extrabold leading-tight ${textClass} text-gradient`}>
          SHADOW<br />OFICIAL
        </div>
      </div>
    </div>
  );
}
