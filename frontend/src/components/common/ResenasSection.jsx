import { useRef, useState } from "react"
import { IconDots, IconFlag, IconStar } from "@tabler/icons-react"
import { StarRating }        from "./StarRating"
import { OrderByDropdown }   from "./Dropdown"
import { ReporteModal }    from "./ReporteModal"
import { useAuth }         from "../../context/AuthContext"

const ORDEN_RESENAS = [
  { value: "recientes",  label: "Más recientes"      },
  { value: "antiguos",   label: "Más antiguos"       },
  { value: "mayor_cal",  label: "Mayor calificación" },
  { value: "menor_cal",  label: "Menor calificación" },
]

function fmtFecha(iso) {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit", month: "2-digit", year: "numeric"
  })
}

function ResenaCard({ resena, onReportar }) {
  const [opcionesAbiertas, setOpcionesAbiertas] = useState(false)
  const ref = useRef(null)

  return (
    <div className="bg-bg-light rounded-md px-4 py-4 flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {resena.foto_perfil_url ? (
            <img
              src={resena.foto_perfil_url}
              alt={resena.nombre_cliente}
              className="w-9 h-9 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-bg-dark shrink-0" />
          )}
          <div className="flex flex-col gap-1">
            <span className="font-body text-sm text-text-dark font-medium">
              {resena.nombre_cliente || "Usuario"}
            </span>
            <StarRating value={resena.calificacion_item} readonly size={14} />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-body text-xs text-text-light">{fmtFecha(resena.fecha)}</span>
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpcionesAbiertas(!opcionesAbiertas)}
              className="text-text-light hover:text-text-dark transition-colors"
            >
              <IconDots size={16} stroke={1.5} />
            </button>
            {opcionesAbiertas && (
              <div className="absolute right-0 top-[calc(100%+4px)] bg-bg-light rounded-md shadow-lg z-50 w-32 overflow-hidden">
                <button
                  onClick={() => { setOpcionesAbiertas(false); onReportar?.() }}
                  className="flex items-center gap-2 w-full px-3 py-2 font-body text-sm text-text-regular hover:bg-bg-dark transition-colors"
                >
                  <IconFlag size={14} stroke={1.5} />
                  Reportar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {resena.comentario && (
        <p className="font-body text-sm text-text-regular leading-relaxed">
          {resena.comentario}
        </p>
      )}
    </div>
  )
}

export function ResenasSection({ resenas, promedio, orden, onOrdenChange, onAgregarResena, esCliente }) {
  const { estaAutenticado } = useAuth()
  const [resenaAReportar, setResenaAReportar] = useState(null)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl text-text-dark">Reseñas</h2>
        <OrderByDropdown
          opciones={ORDEN_RESENAS}
          valorActivo={orden}
          onChange={onOrdenChange}
        />
      </div>

      <div className="flex items-start gap-8">

        {/* Resumen calificación */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <IconStar size={28} color="var(--color-text-regular)" stroke={1.5} />
            <span className="font-body text-2xl text-text-regular pt-0.5">{promedio}</span>
          </div>
          <span className="font-body text-sm text-text-light">{resenas.length.toString().padStart(1, "0")} reseñas</span>
          {esCliente && (
            <button
              onClick={onAgregarResena}
              className="mt-2 px-4 py-2 bg-primary text-white font-body text-sm rounded-md hover:bg-aux transition-colors"
            >
              Agregar reseña
            </button>
          )}
        </div>

        {/* Lista */}
        <div className="flex flex-col gap-3 flex-1">
          {resenas.length === 0 ? (
            <p className="font-body text-sm text-text-light pl-5">No hay reseñas todavía.</p>
          ) : (
            resenas.map((r) => (
              <ResenaCard
                key={r.id_resena}
                resena={r}
                onReportar={estaAutenticado ? () => setResenaAReportar(r) : null}
              />
            ))
          )}
        </div>

        {resenaAReportar && (
          <ReporteModal
            tipo="resena"
            idReferencia={resenaAReportar.id_resena}
            nombreContenido={`Reseña de ${resenaAReportar.nombre_cliente || "Usuario"}`}
            onClose={() => setResenaAReportar(null)}
          />
        )}

      </div>
    </div>
  )
}