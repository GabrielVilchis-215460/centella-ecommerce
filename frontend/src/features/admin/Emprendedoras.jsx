import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { adminService } from "../../services/adminService"
import { useGestionEmprendedora } from "../../hooks/useGestionEmprendedoras.js"
import { Header } from "../../components/layout/Header.jsx"
import { Footer } from "../../components/layout/Footer.jsx"
import { DataTable } from "../../components/common/DataTable.jsx"
import { Modal } from "../../components/common/Modal.jsx"
import { OrderByDropdown, FilterDropdown } from "../../components/common/Dropdown.jsx"
import {
  IconCancel,
  IconMail,
  IconAlertTriangle,
  IconRosetteDiscountCheck,
  IconAlertCircle
} from "@tabler/icons-react"
import { StatusBadge } from "../../components/common/StatusBadge.jsx"

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatFecha = (f) =>
  new Date(f).toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" })

function ModalVerificar({ emprendedora, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
    onClose()
  }

  return (
    <Modal titulo="Verificar Cuenta" onClose={onClose} size="sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 p-4 bg-states-green/30 rounded-lg">
          <IconRosetteDiscountCheck  size={20} stroke={1.5} className="text-green-500 mt-0.5 shrink-0" />
          <p className="text-sm font-body text-text-regular">
            ¿Estás seguro de que deseas verificar la cuenta de{" "}
            <span className="font-medium text-text-dark">{emprendedora.nombre_negocio}</span>?
            Esta acción permitirá a la emprendedora acceder completamente a la plataforma.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 font-body text-sm text-text-regular hover:text-text-dark transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-6 py-2 bg-primary text-white font-body text-sm rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Verificar"}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function ModalSuspender({ emprendedora, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
    onClose()
  }

  return (
    <Modal titulo="Suspender Cuenta" onClose={onClose} size="sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 p-4 bg-states-red/30 rounded-lg">
          <IconAlertTriangle size={20} stroke={1.5} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm font-body text-text-regular">
            ¿Estás seguro de que deseas suspender la cuenta de{" "}
            <span className="font-medium text-text-dark">{emprendedora.nombre_negocio}</span>?
          </p>
        </div>

        <ul className="flex flex-col gap-1 px-4 text-sm font-body text-text-regular list-disc list-inside bg-bg rounded-lg p-4">
          <p>Esta acción realizará lo siguiente: </p>  
          <li>Bloqueará el acceso a la cuenta inmediatamente</li>
          <li>Enviará un correo de notificación a la emprendedora</li>
          <li>Ocultará sus productos del marketplace</li>
        </ul>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 font-body text-sm text-text-regular hover:text-text-dark transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-6 py-2 bg-primary text-white font-body text-sm rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Suspendiendo..." : "Suspender"}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export function Emprendedoras() {
  const [filtros, setFiltros] = useState({
    q: "",
    estado: null,
    insignia: undefined,
    ordenar_por: null,
  })
  const [busqueda, setBusqueda]         = useState("")
  const [modalVerificar, setModalVerificar] = useState(null)
  const [modalSuspender, setModalSuspender] = useState(null)
  const [checks, setChecks] = useState({
    verificada:   true,
    pendiente:    true,
    suspendida:   true,
    con_insignia: true,
    sin_insignia: true,
  })
  const { datos, loading, error, refetch } = useGestionEmprendedora(filtros)

  // Búsqueda con debounce
  useEffect(() => {
    const t = setTimeout(() => setFiltros((f) => ({ ...f, q: busqueda })), 200)
    return () => clearTimeout(t)
  }, [busqueda])

  const handleVerificar = async () => {
    await adminService.verificarEmprendedora(modalVerificar.id_emprendedora)
    refetch()
  }

  const handleSuspender = async () => {
    await adminService.suspenderEmprendedora(modalSuspender.id_emprendedora)
    refetch()
  }

  // Columnas del DataTable
  const columnas = [
    {
      key: "nombre",
      label: "Emprendedora",
      width: "2fr",
      render: (fila) => (
        <div className="flex flex-col">
          <span className="font-body text-sm text-text-dark font-medium">{fila.nombre}</span>
          <span className="font-body text-xs text-text-light">{fila.email}</span>
        </div>
      ),
    },
    {
      key: "nombre_negocio",
      label: "Negocio",
      width: "1.5fr",
    },
    {
      key: "estado",
      label: "Estado",
      width: "1fr",
      render: (fila) => (
            <StatusBadge
            texto={fila.estado.charAt(0).toUpperCase() + fila.estado.slice(1)}
            color={
                fila.estado === "verificada" ? "green"  :
                fila.estado === "suspendida" ? "red"    :
                "orange"
            }
            />
        ),
    },
    {
      key: "fecha_registro",
      label: "Fecha Registro",
      width: "1fr",
      render: (fila) => (
        <span className="font-body text-sm text-text-regular">
          {formatFecha(fila.fecha_registro)}
        </span>
      ),
    },
    {
      key: "acciones",
      label: "Acciones",
      width: "2fr",
      render: (fila) => (
        <div className="flex items-center gap-3">
          {fila.estado !== "verificada" && (
            <button
              onClick={(e) => { e.stopPropagation(); setModalVerificar(fila) }}
              className="flex items-center gap-1 text-xs font-body hover:opacity-70 transition-opacity"
            >
              <IconRosetteDiscountCheck size={20} stroke={1.5} className="text-blue-500" />
              Verificar
            </button>
          )}
          {fila.estado !== "suspendida" && (
            <button
              onClick={(e) => { e.stopPropagation(); setModalSuspender(fila) }}
              className="flex items-center gap-1 text-xs font-body hover:opacity-70 transition-opacity"
            >
              <IconCancel size={20} stroke={1.5} className="text-red-500" />
              Suspender
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${fila.email}` }}
            className="flex items-center gap-1 text-xs font-body hover:text-text-dark transition-colors"
          >
            <IconMail size={20} stroke={1.5} className="text-green-500"/>
            Enviar Correo
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* Encabezado */}
        <div className="mb-6">
          <h1 className="text-xl font-heading font-regular text-text-dark">
            Gestión de Emprendedoras
          </h1>
        </div>
        {/* Barra de herramientas */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <span className="font-body text-sm text-text-light">
            {loading ? "..." : `${datos.length} Emprendedoras`}
          </span>

          <span className="text-text-light">•</span>

          <OrderByDropdown
            opciones={[
              { value: "recientes", label: "Más recientes" },
              { value: "nombre",    label: "Nombre" },
              { value: "estado",    label: "Estado" },
            ]}
            valorActivo={filtros.ordenar_por}
            onChange={(val) => setFiltros((f) => ({ ...f, ordenar_por: val }))}
          />

          <span className="text-text-light">•</span>

          {/* Búsqueda */}
          <input
            type="text"
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 min-w-[180px] max-w-xs bg-transparent font-body text-sm text-text-dark placeholder:text-text-light outline-none border-b border-text-light pb-1"
          />

          <span className="text-text-light">•</span>

          <FilterDropdown
            label="Filtrar"
            grupos={[
              {
                label: "Estado",
                opciones: [
                  { key: "verificada", label: "Verificadas" },
                  { key: "pendiente",  label: "Pendientes"  },
                  { key: "suspendida", label: "Suspendidas" },
                ],
              },
              {
                label: "Insignia",
                opciones: [
                  { key: "con_insignia",  label: "Con insignia"  },
                  { key: "sin_insignia", label: "Sin insignia" },
                ],
              },
            ]}
            valores={checks}
            onChange={(vals) => {
                setChecks(vals)

                const estadosActivos = ["verificada", "pendiente", "suspendida"].filter((e) => vals[e])
                
                const estado = estadosActivos.length === 3 || estadosActivos.length === 0
                    ? null
                    : estadosActivos.length === 1
                    ? estadosActivos[0]
                    : estadosActivos.join(",") 

                const insignia = vals.con_insignia && !vals.sin_insignia
                    ? true
                    : !vals.con_insignia && vals.sin_insignia
                    ? false
                    : undefined
                setFiltros((f) => ({ ...f, estado, insignia }))
            }}
          />
        </div>

        {/* Contenido */}
        {error && (
          <div className="bg-bg-light border border-states-red rounded-xl px-5 py-4 text-sm font-body text-error mb-4">
            <IconAlertCircle stroke={2} /> {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm font-body text-text-light py-10 text-center">
            Cargando emprendedoras...
          </p>
        ) : datos.length === 0 ? (
          <p className="text-sm font-body text-text-light py-10 text-center">
            No se encontraron emprendedoras.
          </p>
        ) : (
          <DataTable
            columnas={columnas}
            datos={datos}
          />
        )}

      </main>

      <Footer />

      {/* Modales */}
      {modalVerificar && (
        <ModalVerificar
          emprendedora={modalVerificar}
          onClose={() => setModalVerificar(null)}
          onConfirm={handleVerificar}
        />
      )}
      {modalSuspender && (
        <ModalSuspender
          emprendedora={modalSuspender}
          onClose={() => setModalSuspender(null)}
          onConfirm={handleSuspender}
        />
      )}
    </div>
  )
}