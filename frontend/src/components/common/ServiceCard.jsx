import { useState } from "react"
import { IconRosetteDiscountCheck, IconStar } from "@tabler/icons-react"

export function ServiceCard({ nombre, descripcion, precio, calificacion, categoria, vendedora, verificada = false, color, onClick }) {
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="font-body text-sm text-white">{vendedora}</span>
            {verificada && (
              <IconRosetteDiscountCheck size={16} className="text-white" />
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <IconStar size={16} className="text-white" />
            <span className="font-body text-sm text-white">{calificacion}</span>
          </div>
        </div>

        {/* Nombre */}
        <div className="flex flex-col gap-1 flex-1">
          <p className="font-body text-md font-medium text-white leading-snug">
            {nombre}
          </p>
          {/* Descripcion max 2 lineas */}
          <p className="font-body text-sm text-white/80 leading-snug line-clamp-2">
            {descripcion}
          </p>
        </div>

        {/* categoria y precio (inferior) */}
        <div className="flex items-center justify-between">
          <span className="font-body text-sm text-white/80">{categoria}</span>
          <span className="font-body text-md font-regular text-white">
            ${precio.toFixed(2)}
          </span>
        </div>

      </div>
    </div>
  )
}