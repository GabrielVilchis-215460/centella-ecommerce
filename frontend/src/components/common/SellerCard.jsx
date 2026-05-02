import { useState } from "react"
import { IconCornerDownRight, IconRosetteDiscountCheck, IconStar } from "@tabler/icons-react"

export function SellerCard({ nombre, emprendimiento, calificacion, descripcion, logo, etiquetas = [], verificada = false, color, onClick }) {
    const [hover, setHover] = useState(false)
    const bg = color || "var(--color-secondary)"

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      className="rounded-md overflow-hidden shadow-md cursor-pointer w-full"
      style={{ backgroundColor: bg, opacity: hover ? 1 : 0.9 }}
    >
      <div className="p-4 flex flex-col gap-3 h-full">

        {/* info general (superior) */}
        <div className="flex gap-3">

          {/* izquierda */}
          <div className="flex flex-col gap-1 flex-1">

            {/* Nombre y verificacion */}
            <div className="flex items-center gap-1">
              <span className="font-body text-md font-medium text-white leading-snug">
                {nombre}
              </span>
              {verificada && (
                <IconRosetteDiscountCheck size={18} className="text-white shrink-0" />
              )}
            </div>

            {/* Emprendimiento y calificacion */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <IconCornerDownRight size={16} className="text-white/80" stroke={1.5} />
                <span className="font-body text-sm text-white/80">{emprendimiento}</span>
              </div>
              <div className="flex items-center gap-1">
                <IconStar size={14} className="text-white" />
                <span className="font-body text-sm text-white">{calificacion.toFixed(1)}</span>
              </div>
            </div>

            {/* Descripcion — max 4 líneas */}
            <p className="font-body text-xs text-white/90 leading-snug line-clamp-4 mt-1 min-h-15">
              {descripcion || ""}
            </p>

          </div>

          {/* Logo */}
          <div className="w-28 h-28 rounded-sm bg-white shrink-0 overflow-hidden">
            {logo
              ? <img src={logo} alt={nombre} className="w-full h-full object-cover" />
              : null
            }
          </div>

        </div>

        {/* Etiquetas (inferior) */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {etiquetas.map((etiqueta, i) => (
            <div key={etiqueta} className="flex items-center gap-2">
              <span className="font-body text-sm text-white/80">{etiqueta}</span>
              {i < etiquetas.length - 1 && (
                <span className="text-white/40">•</span>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}