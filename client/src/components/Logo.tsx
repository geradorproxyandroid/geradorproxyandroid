export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const iconSize = size === "sm" ? 36 : size === "lg" ? 56 : 44;
  const textClass = size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-2xl";

  return (
    <div className="flex items-center gap-3">
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>

        {/* Background - sem arredondamento como na imagem */}
        <rect width="100" height="100" fill="url(#bg)" />

        {/*
          S geométrico tracejado ponto a ponto da imagem:
          
          O S tem:
          - bloco superior largo (vai da esquerda até quase a direita)
          - canto sup-direito cortado em 45°
          - abertura interna no topo (pequena, octagonal)
          - diagonal descendo da direita para a esquerda no meio
          - abertura interna embaixo (pequena, octagonal)
          - bloco inferior largo
          - canto inf-esquerdo cortado em 45°
          - canto inf-direito cortado em 45°
        */}
        <path
          d="
            M 18 20
            L 71 20
            L 82 31
            L 82 47
            L 71 58
            L 29 58
            L 18 69
            L 18 80
            L 29 91
            L 71 91
            L 82 80
            L 82 69
            L 71 69
            L 71 80
            L 29 80
            L 29 69
            L 71 69
            L 82 58
            L 82 47

            M 18 20
            L 18 31
            L 29 20
            Z
          "
          fill="white"
          fillRule="nonzero"
        />

        {/* Preenchimento do bloco superior */}
        <polygon points="29,20 71,20 82,31 82,47 71,47 71,31 29,31" fill="white" />
        {/* Abertura interna superior */}
        <polygon points="33,35 60,35 65,40 60,45 33,45 28,40" fill="url(#bg)" />

        {/* Diagonal do meio - parte esquerda inferior */}
        <polygon points="18,58 29,47 71,47 82,58 71,58 29,58" fill="white" />

        {/* Preenchimento do bloco inferior */}
        <polygon points="18,69 29,58 71,58 82,69 82,80 71,91 29,91 18,80" fill="white" />
        {/* Abertura interna inferior */}
        <polygon points="29,69 56,69 65,74 56,79 29,79 20,74" fill="url(#bg)" />

        {/* Tampa do topo esquerdo */}
        <polygon points="18,31 18,47 29,47 29,31" fill="white" />
      </svg>

      <div>
        <div className={`font-extrabold leading-tight ${textClass} text-gradient`}>
          SHADOW<br />OFICIAL
        </div>
      </div>
    </div>
  );
}
