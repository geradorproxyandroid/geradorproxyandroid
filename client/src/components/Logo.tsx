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
        <rect width="100" height="100" rx="20" fill="url(#bgGrad)" />
        {/*
          S geométrico - reconstruído pixel a pixel da imagem de referência:
          - Topo: bloco largo horizontal com cantos cortados (octagonal)
          - Meio: diagonal da direita para a esquerda
          - Base: bloco largo horizontal com cantos cortados (octagonal)
        */}
        <path
          d="
            M 32 18
            L 68 18
            L 76 26
            L 76 44
            L 68 52
            L 32 52
            L 32 58
            L 68 58
            L 76 66
            L 76 74
            L 68 82
            L 32 82
            L 24 74
            L 24 56
            L 32 48
            L 68 48
            L 68 44
            L 32 44
            L 24 36
            L 24 26
            Z
          "
          fill="white"
        />
        {/* Buraco superior (interior do S em cima) */}
        <path
          d="M 34 28 L 66 28 L 66 36 L 34 36 Z"
          fill="url(#bgGrad)"
        />
        {/* Buraco inferior (interior do S embaixo) */}
        <path
          d="M 34 62 L 66 62 L 66 70 L 34 70 Z"
          fill="url(#bgGrad)"
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
