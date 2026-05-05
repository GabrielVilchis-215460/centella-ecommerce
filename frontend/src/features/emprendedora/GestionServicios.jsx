import { useState } from "react"
import { Navigate } from "react-router-dom"
import { IconHeartHandshake } from "@tabler/icons-react"
import { Icon }  from "../../components/common/Icon"
import { Header } from "../../components/layout/Header"
import { Footer } from "../../components/layout/Footer"
import { Pagination } from "../../components/common/Pagination"
import { StatusBadge } from "../../components/common/StatusBadge"
import { DataTable } from "../../components/common/DataTable"
import { ServicioModal } from "../../components/common/ServicioModal"
import { Button } from "../../components/common/Button"
import { OrderByDropdown, FilterDropdown } from "../../components/common/Dropdown"
import { useAuth } from "../../context/AuthContext"
import { useGestionServicios } from "../../hooks/useGestionServicios"

const ORDENAR_OPCIONES = [
  { value: "recientes", label: "Más recientes" },
  { value: "nombre",    label: "Nombre A-Z"    },
  { value: "precio",    label: "Precio"        },
]

const FILTER_GRUPOS = [
  {
    label: "Estado",
    opciones: [
      { key: "activo",   label: "Activo"   },
      { key: "inactivo", label: "Inactivo" },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtFecha(iso) {
  if (!iso) return "—"
  const d = new Date(iso)
  return d.toLocaleDateString("es-MX", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

function fmtPrecio(valor) {
  return `$${Number(valor).toFixed(2)}`
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-bg-dark ${className}`} />
}

// ─── Columnas DataTable ───────────────────────────────────────────────────────
const COLUMNAS = [
  {
    key:   "nombre",
    label: "Nombre",
    width: "2fr",
  },
  {
    key:   "precio",
    label: "Precio",
    width: "1fr",
    render: (fila) => (
      <span className="font-body text-sm text-text-regular">
        {fmtPrecio(fila.precio)}
      </span>
    ),
  },
  {
    key:   "activo",
    label: "Estado",
    width: "1fr",
    render: (fila) => (
      <StatusBadge
        texto={fila.activo ? "Activo" : "Inactivo"}
        color={fila.activo ? "green" : "gray"}
      />
    ),
  },
  {
    key:   "fecha_creacion",
    label: "Última edición",
    width: "1fr",
    render: (fila) => (
      <span className="font-body text-sm text-text-light">
        {fmtFecha(fila.fecha_creacion)}
      </span>
    ),
  },
  {
    key:   "eliminar",
    label: "Eliminar",
    width: "80px",
  },
]

export function GestionServicios() {
  const { usuario, cargando: cargandoAuth } = useAuth()
  const {
    servicios, total, pagina, setPagina, totalPaginas,
    categorias, cargando, error,
    crearServicio, actualizarServicio, eliminarServicio,
  } = useGestionServicios()

  const [busqueda, setBusqueda] = useState("")
  const [ordenar, setOrdenar] = useState("")
  const [filtros, setFiltros] = useState({ activo: true, inactivo: true })
  const [modalAbierto, setModalAbierto] = useState(false)
  const [servicioEditar, setServicioEditar] = useState(null)

  if (!cargandoAuth && usuario?.tipo_usuario !== "emprendedora") {
    return <Navigate to="/" replace />
  }
  // Filtrar y ordenar en frontend
  let datosFiltrados = servicios.filter((s) => {
    const estadoOk  = s.activo ? filtros.activo : filtros.inactivo
    const busquedaOk = busqueda
      ? s.nombre.toLowerCase().includes(busqueda.toLowerCase())
      : true
    return estadoOk && busquedaOk
  })

  if (ordenar === "nombre") {
    datosFiltrados = [...datosFiltrados].sort((a, b) => a.nombre.localeCompare(b.nombre))
  } else if (ordenar === "precio") {
    datosFiltrados = [...datosFiltrados].sort((a, b) => Number(a.precio) - Number(b.precio))
  }

  const datosTabla = datosFiltrados.map((s) => ({ ...s, id: s.id_servicio }))

  const handleGuardar = async (datos) => {
    // Normalizar datos para el backend
    const body = {
      nombre:             datos.nombre,
      descripcion:        datos.descripcion || null,
      precio:             datos.precio,
      enlace_reservacion: datos.enlaces?.url || datos.otroEnlace || "",
      activo:             datos.activo,
      id_categoria:       Number(datos.categoria),
      fecha_creacion:     new Date().toISOString(),
    }

    if (servicioEditar) {
      await actualizarServicio(servicioEditar.id_servicio, body)
    } else {
      await crearServicio(body)
    }

    setModalAbierto(false)
    setServicioEditar(null)
  }

  const handleRowClick = (fila) => {
    setServicioEditar(fila)
    setModalAbierto(true)
  }

  const handleEliminar = async (fila) => {
    if (!window.confirm(`¿Eliminar "${fila.nombre}"?`)) return
    await eliminarServicio(fila.id_servicio)
  }

  // Normalizar servicio para el modal
  const servicioModal = servicioEditar ? {
    nombre:      servicioEditar.nombre,
    descripcion: servicioEditar.descripcion,
    precio:      Number(servicioEditar.precio),
    categoria:   String(servicioEditar.id_categoria),
    activo:      servicioEditar.activo,
    enlaces: servicioEditar.enlace_reservacion?.includes("wa.me") || 
           servicioEditar.enlace_reservacion?.includes("whatsapp")
    ? { whatsapp: servicioEditar.enlace_reservacion }
    : servicioEditar.enlace_reservacion?.includes("facebook")
    ? { facebook: servicioEditar.enlace_reservacion }
    : servicioEditar.enlace_reservacion?.includes("instagram")
    ? { instagram: servicioEditar.enlace_reservacion }
    : { web: servicioEditar.enlace_reservacion },
  } : null

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header />

      <main className="flex-1 w-full mx-auto max-w-7xl px-6 py-8 space-y-6">

        {/* Título + botón agregar */}
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-xl font-bold text-text-regular">
            Gestión de Servicios
          </h1>
          <Button
            size="sm"
            className="w-auto! px-6"
            onClick={() => { setServicioEditar(null); setModalAbierto(true) }}
          >
            Agregar servicio
          </Button>
        </div>

        {/* Barra de controles */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-body text-sm text-text-light">
            {cargando ? "—" : `${total} servicios`}
          </span>

          <span className="text-text-light text-sm">•</span>

          <OrderByDropdown
            opciones={ORDENAR_OPCIONES}
            valorActivo={ordenar}
            onChange={setOrdenar}
          />

          {/* Buscar */}
          <div className="flex items-center gap-2 bg-bg-light rounded-lg px-3 py-1.5 shadow-sm flex-1 max-w-56">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar..."
              className="bg-transparent font-body text-sm text-text-regular outline-none w-full
                         placeholder:text-text-light"
            />
          </div>

          <span className="text-text-light text-sm">•</span>

          <FilterDropdown
            label="Filtrar"
            grupos={FILTER_GRUPOS}
            valores={filtros}
            onChange={setFiltros}
          />
        </div>

        {/* Tabla */}
        {error ? (
          <p className="text-error text-sm text-center">{error}</p>
        ) : cargando ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : datosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Icon icon={IconHeartHandshake} size={40} color="var(--color-text-light)" />
            <p className="font-body text-sm text-text-light">No hay servicios que mostrar</p>
          </div>
        ) : (
          <DataTable
            columnas={COLUMNAS}
            datos={datosTabla}
            onRowClick={handleRowClick}
            onEliminar={handleEliminar}
          />
        )}

        {/* Paginación */}
        {!cargando && totalPaginas > 1 && (
          <div className="flex justify-center">
            <Pagination
              paginaActual={pagina}
              totalPaginas={totalPaginas}
              onChange={setPagina}
            />
          </div>
        )}

      </main>

      <Footer />

      {/* Modal */}
      {modalAbierto && (
        <ServicioModal
          servicio={servicioModal}
          categorias={categorias}
          onClose={() => { setModalAbierto(false); setServicioEditar(null) }}
          onGuardar={handleGuardar}
        />
      )}
    </div>
  )
}
