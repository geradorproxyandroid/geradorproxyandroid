export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const iconSize = size === "sm" ? 36 : size === "lg" ? 56 : 44;
  const textClass = size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-2xl";
  const subClass = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className="flex items-center gap-3">
      {/* S logo with gradient background */}
      <img
        src="/manus-storage/83C3B51F-8DB5-4E03-A867-E916CED33459_690f0cd8.png"
        alt="Shadow Logo"
        style={{
          width: iconSize,
          height: iconSize,
          borderRadius: "30%",
          flexShrink: 0,
          objectFit: "cover",
        }}
      />

      {/* Text */}
      <div>
        <div className={`font-extrabold leading-tight ${textClass} text-gradient`}>
          SHADOW<br />OFICIAL
        </div>
      </div>
    </div>
  );
}
