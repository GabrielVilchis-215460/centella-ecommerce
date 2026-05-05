// src/features/admin/GestionInsignias.jsx

import { useState, useEffect } from "react"
import { IconSearch, IconChevronDown, IconCircleCheck, IconX, IconMail } from "@tabler/icons-react"
import { Header }       from "../../components/layout/Header"
import { Footer }       from "../../components/layout/Footer"
import { adminService } from "../../services/adminService"

const ORDEN_OPTS = [
  { value: "recientes", label: "Más recientes" },
  { value: "nombre",    label: "Nombre"        },
]

const FILTRO_OPTS = [
  { value: "",         label: "Todos"         },
  { value: "pending",  label: "Pendientes"    },
  { value: "approved", label: "Aprobadas"     },
  { value: "none",     label: "Sin solicitud" },
]

function getEstado(item) {
  if (item.solicitud_activa) return "pending"
  if (item.insignia)         return "approved"
  return "none"
}

const ESTADO_BADGE = {
  pending:  { label: "Pendiente",     className: "bg-yellow-100 text-yellow-700 border border-yellow-300"  },
  approved: { label: "Aprobada",      className: "bg-green-100 text-green-700 border border-green-300"    },
  none:     { label: "Sin solicitud", className: "bg-bg-dark text-text-light border border-text-light/30" },
}

function fmtFecha(iso) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric", month: "long", year: "numeric"
  })
}

export function GestionInsignias() {
  const [items,         setItems]         = useState([])
  const [cargando,      setCargando]      = useState(true)
  const [error,         setError]         = useState("")
  const [busqueda,      setBusqueda]      = useState("")
  const [orden,         setOrden]         = useState("recientes")
  const [filtro,        setFiltro]        = useState("")
  const [ordenAbierto,  setOrdenAbierto]  = useState(false)
  const [filtroAbierto, setFiltroAbierto] = useState(false)

  const cargar = async () => {
    try {
      setCargando(true)
      const res = await adminService.getInsignias()
      setItems(res.data)
    } catch {
      setError("Error al cargar las insignias.")
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const handleAprobar = async (id) => {
    try {
      await adminService.aprobarInsignia(id)
      cargar()
    } catch {
      setError("Error al aprobar la insignia.")
    }
  }

  const handleRechazar = async (id) => {
    try {
      await adminService.rechazarInsignia(id)
      cargar()
    } catch {
      setError("Error al rechazar la insignia.")
    }
  }

  const handleRevocar = async (id) => {
    try {
      await adminService.revocarInsignia(id)
      cargar()
    } catch {
      setError("Error al revocar la insignia.")
    }
  }

  const itemsFiltrados = items
    .filter((i) => {
      if (
        busqueda &&
        !i.nombre_negocio.toLowerCase().includes(busqueda.toLowerCase()) &&
        !i.nombre_solicitante?.toLowerCase().includes(busqueda.toLowerCase())
      ) return false
      if (filtro && getEstado(i) !== filtro) return false
      return true
    })
    .sort((a, b) => {
      if (orden === "nombre") return a.nombre_negocio.localeCompare(b.nombre_negocio)
      return 0
    })

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 flex flex-col gap-6">

        <h1 className="font-heading text-3xl text-text-dark">Gestión de Insignias</h1>

        {/* Barra de controles */}
        <div className="flex items-center gap-3 flex-wrap">

          <span className="font-body text-sm text-text-light">
            {String(itemsFiltrados.length).padStart(2, "0")} Emprendedoras
          </span>

          <span className="text-text-light/40">•</span>

          {/* Ordenar */}
          <div className="relative">
            <button
              onClick={() => { setOrdenAbierto(!ordenAbierto); setFiltroAbierto(false) }}
              className="flex items-center gap-1 font-body text-sm text-text-regular hover:text-text-dark transition-colors"
            >
              Ordenar por <IconChevronDown size={14} stroke={1.5} />
            </button>
            {ordenAbierto && (
              <div className="absolute left-0 top-[calc(100%+4px)] bg-bg-light rounded-md shadow-lg z-50 w-40 overflow-hidden">
                {ORDEN_OPTS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => { setOrden(o.value); setOrdenAbierto(false) }}
                    className={`w-full text-left px-4 py-2 font-body text-sm transition-colors hover:bg-bg-dark ${
                      orden === o.value ? "text-primary" : "text-text-regular"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="text-text-light/40">•</span>

          {/* Búsqueda */}
          <div className="flex items-center gap-2 border-b border-text-light/40 pb-0.5">
            <IconSearch size={14} stroke={1.5} color="var(--color-text-light)" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar..."
              className="font-body text-sm text-text-regular bg-transparent outline-none placeholder:text-text-light/50 w-40"
            />
          </div>

          <span className="text-text-light/40">•</span>

          {/* Filtrar */}
          <div className="relative">
            <button
              onClick={() => { setFiltroAbierto(!filtroAbierto); setOrdenAbierto(false) }}
              className="flex items-center gap-1 font-body text-sm text-text-regular hover:text-text-dark transition-colors"
            >
              Filtrar <IconChevronDown size={14} stroke={1.5} />
            </button>
            {filtroAbierto && (
              <div className="absolute left-0 top-[calc(100%+4px)] bg-bg-light rounded-md shadow-lg z-50 w-40 overflow-hidden">
                {FILTRO_OPTS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => { setFiltro(o.value); setFiltroAbierto(false) }}
                    className={`w-full text-left px-4 py-2 font-body text-sm transition-colors hover:bg-bg-dark ${
                      filtro === o.value ? "text-primary" : "text-text-regular"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && <p className="font-body text-sm text-error">{error}</p>}

        {/* Lista */}
        {cargando ? (
          <div className="flex justify-center py-12">
            <span className="font-body text-sm text-text-light">Cargando...</span>
          </div>
        ) : itemsFiltrados.length === 0 ? (
          <p className="font-body text-sm text-text-light text-center py-12">
            No se encontraron resultados.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {itemsFiltrados.map((item) => {
              const estado = getEstado(item)
              const badge  = ESTADO_BADGE[estado]
              return (
                <div key={item.id_emprendedora} className="bg-bg-light rounded-xl shadow-sm flex overflow-hidden">

                  {/* Contenido principal */}
                  <div className="flex-1 px-6 py-5 flex flex-col gap-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-3">
                        <span className="font-heading text-base text-text-dark">{item.nombre_negocio}</span>
                        <span className={`font-body text-xs px-3 py-0.5 rounded-full ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>
                      {item.nombre_solicitante && (
                        <span className="font-body text-sm text-text-light">
                          Solicitante: {item.nombre_solicitante}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-6 flex-wrap">
                      {item.email && (
                        <div className="flex items-center gap-1.5">
                          <IconMail size={14} stroke={1.5} color="var(--color-text-light)" />
                          <span className="font-body text-sm text-text-light">{item.email}</span>
                        </div>
                      )}
                      {item.fecha_solicitud && (
                        <span className="font-body text-sm text-text-light">
                          Solicitado el {fmtFecha(item.fecha_solicitud)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Columna de acciones */}
                  {(estado === "pending" || estado === "approved") && (
                    <div className="flex flex-col items-start justify-center gap-2 px-5">
                      {estado === "pending" && (
                        <>
                          <button
                            onClick={() => handleAprobar(item.id_emprendedora)}
                            className="flex items-center gap-1.5 font-body text-sm text-green-600 hover:text-green-700 transition-colors whitespace-nowrap"
                          >
                            <IconCircleCheck size={16} stroke={1.5} />
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleRechazar(item.id_emprendedora)}
                            className="flex items-center gap-1.5 font-body text-sm text-error hover:text-red-700 transition-colors whitespace-nowrap"
                          >
                            <IconX size={16} stroke={1.5} />
                            Rechazar
                          </button>
                          {item.email && (
                            <a
                              href={`mailto:${item.email}`}
                              className="flex items-center gap-1.5 font-body text-sm text-primary hover:text-aux transition-colors whitespace-nowrap"
                            >
                              <IconMail size={16} stroke={1.5} />
                              Solicitar Información
                            </a>
                          )}
                        </>
                      )}
                      {estado === "approved" && (
                        <button
                          onClick={() => handleRevocar(item.id_emprendedora)}
                          className="flex items-center gap-1.5 font-body text-sm text-error hover:text-red-700 transition-colors whitespace-nowrap"
                        >
                          <IconX size={16} stroke={1.5} />
                          Revocar
                        </button>
                      )}
                    </div>
                  )}

                </div>
              )
            })}
          </div>
        )}

      </main>

      <Footer />
    </div>
  )
}