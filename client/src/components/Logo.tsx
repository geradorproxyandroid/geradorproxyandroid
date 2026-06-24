export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const iconSize = size === "sm" ? 36 : size === "lg" ? 56 : 44;
  const textClass = size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-2xl";

  return (
    <div className="flex items-center gap-3">
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="bgG" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
        {/* Rounded square background */}
        <rect width="200" height="200" rx="44" fill="url(#bgG)" />
        {/* 
          Geometric S - faithful to the reference:
          Top block (wide), curves right then diagonal to bottom-left,
          Bottom block (wide), curves left
        */}
        <path
          d="
            M 60 36
            L 154 36
            L 168 50
            L 168 88
            L 154 102
            L 60 102
            L 46 116
            L 46 150
            L 60 164
            L 140 164
            L 154 150
            L 154 136
            L 140 136
            L 140 136
            L 140 150
            L 60 150
            L 60 116
            L 154 116
            L 168 102
            L 168 88

            M 60 36
            L 60 50
            L 154 50
            L 154 88
            L 60 88
            L 46 102
            L 46 50
            Z
          "
          fill="white"
          fillRule="evenodd"
        />
        {/* Top inner hole */}
        <rect x="72" y="58" width="70" height="22" rx="6" fill="url(#bgG)" />
        {/* Bottom inner hole */}
        <rect x="72" y="122" width="56" height="22" rx="6" fill="url(#bgG)" />
      </svg>

      <div>
        <div className={`font-extrabold leading-tight ${textClass} text-gradient`}>
          SHADOW<br />OFICIAL
        </div>
      </div>
    </div>
  );
}
