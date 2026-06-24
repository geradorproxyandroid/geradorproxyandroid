export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const iconSize = size === "sm" ? 36 : size === "lg" ? 56 : 44;
  const textClass = size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-2xl";

  return (
    <div className="flex items-center gap-3">
      {/* S logo with gradient background */}
      <div
        style={{
          width: iconSize,
          height: iconSize,
          borderRadius: "30%",
          flexShrink: 0,
          background: "linear-gradient(135deg, #9333ea, #ec4899)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: 900,
          fontSize: iconSize * 0.55,
          fontFamily: "sans-serif",
        }}
      >
        S
      </div>

      {/* Text */}
      <div>
        <div className={`font-extrabold leading-tight ${textClass} text-gradient`}>
          SHADOW<br />OFICIAL
        </div>
      </div>
    </div>
  );
}
