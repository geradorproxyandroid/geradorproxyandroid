export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const iconSize = size === "sm" ? 36 : size === "lg" ? 56 : 44;
  const textClass = size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-2xl";

  return (
    <div className="flex items-center gap-3">
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
        {/* Background rounded square */}
        <rect width="100" height="100" rx="22" fill="url(#bgGrad)" />
        {/* Letter S - geometric bold, like the reference image */}
        <path
          d="
            M 65 20
            L 35 20
            L 22 33
            L 22 48
            L 35 48
            L 35 33
            L 65 33
            L 65 45
            L 35 45
            L 22 58
            L 22 67
            L 35 80
            L 65 80
            L 78 67
            L 78 52
            L 65 52
            L 65 67
            L 35 67
            L 35 58
            L 65 58
            L 78 45
            L 78 33
            Z
          "
          fill="white"
        />
      </svg>

      <div>
        <div className={`font-extrabold leading-tight ${textClass} text-gradient`}>
          SHADOW<br />OFICIAL
        </div>
      </div>
    </div>
  );
}
