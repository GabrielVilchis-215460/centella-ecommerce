import { useState, useEffect } from "react"
import {
  IconSearch, IconChevronDown, IconAlertTriangle,
  IconBox, IconShoppingBag, IconStar, IconUser, IconMail,
} from "@tabler/icons-react"
import { Header }       from "../../components/layout/Header"
import { Footer }       from "../../components/layout/Footer"
import { Modal }        from "../../components/common/Modal"
import { Button }       from "../../components/common/Button"
import { adminService } from "../../services/adminService"

const ORDEN_OPTS = [
  { value: "recientes", label: "Más recientes" },
  { value: "estado",    label: "Estado"        },
]

const FILTRO_OPTS = [
  { value: "",           label: "Todos"       },
  { value: "pendiente",  label: "Pendientes"  },
  { value: "resuelto",   label: "Resueltos"   },
  { value: "descartado", label: "Descartados" },
]

const TIPO_ICON = {
  producto:  IconBox,
  servicio:  IconShoppingBag,
  resena:    IconStar,
  vendedora: IconUser,
}

const TIPO_LABEL = {
  producto:  "PRODUCTO",
  servicio:  "SERVICIO",
  resena:    "RESEÑA",
  vendedora: "EMPRENDIMIENTO",
}

const ESTADO_BADGE = {
  pendiente:  "bg-yellow-100 text-yellow-700 border-yellow-300",
  resuelto:   "bg-green-100 text-green-700 border-green-300",
  descartado: "bg-bg-dark text-text-light border-text-light/30",
}

const ESTADO_LABEL = {
  pendiente:  "Pendiente",
  resuelto:   "Resuelto",
  descartado: "Descartado",
}

const CONFIRMAR_CONFIG = {
  eliminar: {
    titulo: "¿Eliminar publicación?",
    descripcion: "Esta acción eliminará permanentemente el contenido reportado. El propietario será notificado por correo electrónico.",
  },
  suspender: {
    titulo: "¿Suspender cuenta?",
    descripcion: "Esta acción suspenderá la cuenta del usuario. El propietario será notificado por correo electrónico.",
  },
}

function fmtFecha(iso) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric", month: "long", year: "numeric"
  })
}

export function Moderacion() {
  const [items,         setItems]         = useState([])
  const [cargando,      setCargando]      = useState(true)
  const [error,         setError]         = useState("")
  const [busqueda,      setBusqueda]      = useState("")
  const [orden,         setOrden]         = useState("recientes")
  const [filtro,        setFiltro]        = useState("")
  const [ordenAbierto,  setOrdenAbierto]  = useState(false)
  const [filtroAbierto, setFiltroAbierto] = useState(false)
  const [confirmacion,  setConfirmacion]  = useState(null)
  // confirmacion = { tipo: "eliminar" | "suspender", id: number } | null

  const cargar = async () => {
    try {
      setCargando(true)
      const res = await adminService.getReportes()
      setItems(res.data)
    } catch {
      setError("Error al cargar los reportes.")
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const handleEliminar  = (id) => setConfirmacion({ tipo: "eliminar",  id })
  const handleSuspender = (id) => setConfirmacion({ tipo: "suspender", id })

  const confirmarAccion = async () => {
    if (!confirmacion) return
    try {
      if (confirmacion.tipo === "eliminar") {
        await adminService.eliminarPublicacion(confirmacion.id)
      } else {
        await adminService.suspenderCuenta(confirmacion.id)
      }
      cargar()
    } catch {
      setError("Error al ejecutar la acción.")
    } finally {
      setConfirmacion(null)
    }
  }

  const handleDescartar = async (id) => {
    try {
      await adminService.descartarReporte(id)
      cargar()
    } catch {
      setError("Error al descartar el reporte.")
    }
  }

  const itemsFiltrados = items
    .filter((i) => {
      if (filtro && i.estado !== filtro) return false
      if (busqueda) {
        const q = busqueda.toLowerCase()
        if (
          !i.nombre_contenido?.toLowerCase().includes(q) &&
          !i.propietario?.toLowerCase().includes(q) &&
          !i.reportado_por?.toLowerCase().includes(q)
        ) return false
      }
      return true
    })
    .sort((a, b) => {
      if (orden === "estado") return a.estado.localeCompare(b.estado)
      return 0
    })

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 flex flex-col gap-6">

        <h1 className="font-heading text-3xl text-text-dark">Moderación de contenido</h1>

        {/* Barra de controles */}
        <div className="flex items-center gap-3 flex-wrap">

          <span className="font-body text-sm text-text-light">
            {String(itemsFiltrados.length).padStart(2, "0")} Reportes
          </span>

          <span className="text-text-light/40">•</span>

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

        {cargando ? (
          <div className="flex justify-center py-12">
            <span className="font-body text-sm text-text-light">Cargando...</span>
          </div>
        ) : itemsFiltrados.length === 0 ? (
          <p className="font-body text-sm text-text-light text-center py-12">
            No se encontraron reportes.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {itemsFiltrados.map((item) => {
              const TipoIcon = TIPO_ICON[item.tipo_contenido] ?? IconBox
              const pendiente = item.estado === "pendiente"
              return (
                <div key={item.id_reporte} className="bg-bg-light rounded-xl shadow-sm overflow-hidden">

                  {/* Cuerpo */}
                  <div className="px-6 py-5 flex flex-col gap-4">

                    {/* Fila superior: tipo+nombre a la izquierda, badge a la derecha */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-bg-dark flex items-center justify-center shrink-0">
                          <TipoIcon size={20} stroke={1.5} color="var(--color-text-regular)" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-body text-xs text-text-light uppercase tracking-wide">
                            {TIPO_LABEL[item.tipo_contenido] ?? item.tipo_contenido}
                          </span>
                          <span className="font-heading text-base text-text-dark">
                            {item.nombre_contenido ?? `Referencia #${item.id_referencia}`}
                          </span>
                        </div>
                      </div>

                      {/* Badge estado */}
                      <span className={`font-body text-xs px-3 py-0.5 rounded-full border shrink-0 ${
                        ESTADO_BADGE[item.estado] ?? ESTADO_BADGE.descartado
                      }`}>
                        {ESTADO_LABEL[item.estado] ?? item.estado}
                      </span>
                    </div>

                    {/* Propietaria / Reportado por */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-body text-xs text-text-light">Propietaria:</span>
                        <span className="font-body text-sm text-text-dark">{item.propietario ?? "—"}</span>
                        {item.propietario_email && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <IconMail size={12} color="var(--color-text-light)" />
                            <span className="font-body text-xs text-text-light">{item.propietario_email}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-body text-xs text-text-light">Reportado por:</span>
                        <span className="font-body text-sm text-text-dark">{item.reportado_por_email ?? "—"}</span>
                        <span className="font-body text-xs text-text-light">{fmtFecha(item.fecha)}</span>
                      </div>
                    </div>

                    {/* Motivo */}
                    {item.motivo && (
                      <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-3 flex gap-3">
                        <IconAlertTriangle size={16} stroke={1.5} color="var(--color-error)" className="shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-0.5">
                          <span className="font-body text-sm font-medium text-text-dark">Motivo del reporte</span>
                          <span className="font-body text-sm text-text-regular">{item.motivo}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botones — solo pendiente */}
                  {pendiente && (
                    <div className="flex items-center gap-3 px-6 py-4 border-t border-text-light/10">
                      {item.tipo_contenido !== "vendedora" && (
                        <button
                          onClick={() => handleEliminar(item.id_reporte)}
                          className="px-5 py-2 bg-text-dark text-white font-body text-sm rounded-full hover:bg-text-regular transition-colors"
                        >
                          Eliminar publicación
                        </button>
                      )}
                      <button
                        onClick={() => handleSuspender(item.id_reporte)}
                        className="px-5 py-2 bg-primary text-white font-body text-sm rounded-full hover:bg-aux transition-colors"
                      >
                        Suspender cuenta
                      </button>
                      <button
                        onClick={() => handleDescartar(item.id_reporte)}
                        className="px-5 py-2 bg-bg-dark text-text-regular font-body text-sm rounded-full hover:bg-text-light/20 transition-colors"
                      >
                        Descartar reporte
                      </button>
                    </div>
                  )}

                </div>
              )
            })}
          </div>
        )}

      </main>

      <Footer />

      {/* Modal de confirmación */}
      {confirmacion && (() => {
        const config = CONFIRMAR_CONFIG[confirmacion.tipo]
        return (
          <Modal
            titulo={config.titulo}
            onClose={() => setConfirmacion(null)}
            size="sm"
          >
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <p className="font-body text-sm text-text-regular leading-relaxed">
                  {config.descripcion}
                </p>
              </div>
              <Button size="sm" onClick={confirmarAccion}>
                Confirmar
              </Button>
            </div>
          </Modal>
        )
      })()}

    </div>
  )
}