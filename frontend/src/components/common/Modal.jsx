import { useEffect } from "react"
import { IconX } from "@tabler/icons-react"

export function Modal({ titulo, onClose, children, size = "md" }) {

  const TAMAÑOS = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
  }

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={`
        bg-bg-light rounded-lg shadow-lg w-full ${TAMAÑOS[size]}
        flex flex-col max-h-[90vh]
      `}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <h2 className="font-heading text-2xl text-text-dark">{titulo}</h2>
          <button
            onClick={onClose}
            className="text-text-light hover:text-text-dark transition-colors"
          >
            <IconX size={20} stroke={1.5} />
          </button>
        </div>

        {/* Contenido — scrolleable si es necesario */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {children}
        </div>

      </div>
    </div>
  )
}