import { useState } from "react"
import { IconX } from "@tabler/icons-react"
import {
  IconBrandWhatsapp,
  IconWorld,
  IconBrandFacebook,
  IconBrandInstagram,
} from "@tabler/icons-react"

const ICONOS = {
  whatsapp:  { icon: IconBrandWhatsapp, label: "WhatsApp"   },
  web:       { icon: IconWorld,         label: "Página Web" },
  facebook:  { icon: IconBrandFacebook, label: "Facebook"   },
  instagram: { icon: IconBrandInstagram,label: "Instagram"  },
}

const PATRONES_URL = {
  whatsapp:  /^https?:\/\/(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)/i,
  facebook:  /^https?:\/\/(www\.)?(facebook\.com|fb\.com|fb\.me)/i,
  instagram: /^https?:\/\/(www\.)?instagram\.com/i,
  web:       /^https?:\/\/.+\..+/i,
}

function validarUrl(red, url) {
  if (!url) return true
  return PATRONES_URL[red] ? PATRONES_URL[red].test(url) : /^https?:\/\/.+/.test(url)
}

// overlay
function EnlaceOverlay({ red, enlace, urlNegocio, onGuardar, onQuitar, onClose }) {
  const [url, setUrl] = useState(enlace || urlNegocio || "")
  const [error, setError] = useState("")
  const { label } = ICONOS[red]

  const handleGuardar = () => {
    if (!validarUrl(red, url)) {
      setError(`Ingresa una URL válida${PATRONES_URL[red] ? ` de ${label}` : ""}.`)
      return
    }
    onGuardar(url)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg-light rounded-lg shadow-lg w-80 p-6 flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-md text-text-dark">{label}</h3>
          <button onClick={onClose} className="text-text-light hover:text-text-dark transition-colors">
            <IconX size={18} stroke={1.5} />
          </button>
        </div>

        {/* Input */}
        <div className="flex flex-col gap-1">
          <label className="font-body text-sm text-text-regular">Enlace</label>
          <div className="relative">
            <input
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError("") }}
              placeholder="https://..."
              className={`w-full px-4 py-3 pr-10 font-body text-sm text-text-regular bg-transparent border rounded-md placeholder:text-text-light focus:outline-none transition-colors ${
                error ? "border-error" : "border-text-light focus:border-text-regular"
              }`}
            />
            {url && (
              <button
                onClick={() => { setUrl(""); setError("") }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-text-dark transition-colors"
              >
                <IconX size={16} stroke={1.5} />
              </button>
            )}
          </div>
          {error && <p className="font-body text-xs text-error">{error}</p>}
          {!enlace && urlNegocio && !url && (
            <p className="font-body text-xs text-text-light">
              Tu negocio ya tiene un enlace guardado para esta red — 
              Si deseas borrarlo o editarlo permanentemente puedes realizarlo en {""}
              <a href="/dashboard/GestionPerfil"
                className="text-primary hover:text-aux underline transition-colors">
                Editar perfil de emprendimiento
              </a>.
            </p>
          )}
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleGuardar}
            disabled={!url.trim()}
            className="w-full py-2 bg-primary text-white font-body text-sm rounded-full hover:bg-aux transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {enlace ? "Guardar cambios" : "Agregar enlace"}
          </button>
          {enlace && (
            <button
              onClick={() => { onQuitar(); onClose() }}
              className="w-full py-2 font-body text-sm text-error hover:text-text-dark transition-colors"
            >
              Quitar enlace
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// boton
export function SocialButton({ red, enlace, urlNegocio, onEnlaceChange, disabled = false, variant = "default" }) {
  const [overlayAbierto, setOverlayAbierto] = useState(false)
  const { icon: IconComponent, label } = ICONOS[red]
  const tieneEnlace = !!enlace
  const isLight = variant === "light"

  return (
    <>
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={() => !disabled && setOverlayAbierto(true)}
          disabled={disabled}
          className={`
            w-12 h-12 rounded-md flex items-center justify-center
            border transition-colors
            ${tieneEnlace
              ? "bg-primary border-primary"
              : isLight
                ? "bg-transparent border-white/60 hover:border-white"
                : "bg-transparent border-text-light hover:border-text-regular"
            }
            ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <IconComponent
            size={22}
            stroke={1.5}
            color={tieneEnlace ? "white" : isLight ? "white" : "var(--color-text-light)"}
          />
        </button>
        <span className={`font-body text-xs ${isLight ? "text-white/80" : "text-text-light"}`}>{label}</span>
      </div>

      {overlayAbierto && (
        <EnlaceOverlay
          red={red}
          enlace={enlace}
          urlNegocio={urlNegocio}
          onGuardar={(url) => onEnlaceChange(red, url)}
          onQuitar={() => onEnlaceChange(red, null)}
          onClose={() => setOverlayAbierto(false)}
        />
      )}
    </>
  )
}