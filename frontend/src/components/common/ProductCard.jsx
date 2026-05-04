import { useState } from "react"
import { IconShoppingCart, IconStar } from "@tabler/icons-react"
import { Button } from "./Button"
import { useAuth } from "../../context/AuthContext"

export function ProductCard({ nombre, precio, calificacion, imagen, onAgregar, onClick }) {
  const [hover, setHover] = useState(false)
  const { esEmprendedora } = useAuth() 

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      className="relative rounded-md overflow-hidden shadow-md cursor-pointer w-full"
    >

      {/* Imagen */}
      <img
        src={imagen || "https://placehold.co/400x300?text=sin+imagen"}
        alt={nombre}
        className="w-full h-56 object-cover"
      />

      {/* agregar a carrito - solo en hover */}
      {hover && onAgregar && (
        <div
          className="absolute top-3 right-3"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="sm"
            onClick={onAgregar}
            className="flex items-center gap-3 w-auto! px-1 text-sm"
          >
            Agregar
            <IconShoppingCart size={18} stroke={2} />
          </Button>
        </div>
      )}

      {/* Info overlay */}
      <div className={`
        absolute bottom-0 left-0 right-0
        px-4 py-3
        transition-colors duration-(--transition-fast)
        ${hover ? "bg-secondary/90" : "bg-secondary/75"}
      `}>

        {/* Nombre */}
        <p className="font-body text-sm text-white font-regular leading-snug mb-2 line-clamp-2 min-h-10">
          {nombre}
        </p>

        {/* Precio y calificacion */}
        <div className="flex items-center justify-between">
          <span className="font-body text-md font-regular text-white">
            ${precio.toFixed(2)}
          </span>
          <div className="flex items-center gap-1">
            <IconStar size={16} className="text-white" />
            <span className="font-body text-sm text-white">{calificacion.toFixed(1)}</span>
          </div>
        </div>

      </div>
    </div>
  )
}