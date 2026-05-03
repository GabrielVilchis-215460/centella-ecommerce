import { useState } from "react"
import { Navigate } from "react-router-dom"
import { IconSearch, IconPackage } from "@tabler/icons-react"
import { Icon }               from "../../components/common/Icon"
import { Header }             from "../../components/layout/Header"
import { Footer }             from "../../components/layout/Footer"
import { Pagination }         from "../../components/common/Pagination"
import { StatusBadge }        from "../../components/common/StatusBadge"
import { DataTable }          from "../../components/common/DataTable"
import { DetallePedidoModal } from "../../components/common/DetallePedidoModal"
import { OrderByDropdown, FilterDropdown } from "../../components/common/Dropdown"
import { useAuth }            from "../../context/AuthContext"
import { useGestionPedidos }  from "../../hooks/useGestionPedidos"

// ─── Constantes ───────────────────────────────────────────────────────────────

const ESTADOS = [
  { value: "pendiente",  label: "Pendiente",   color: "gray"   },
  { value: "confirmado", label: "Confirmado",  color: "orange" },
  { value: "enviado",    label: "En tránsito", color: "blue"   },
  { value: "entregado",  label: "Entregado",   color: "green"  },
  { value: "cancelado",  label: "Cancelado",   color: "red"    },
]

const ORDENAR_OPCIONES = [
  { value: "recientes",  label: "Fecha (más nuevo)" },
  { value: "total_desc", label: "Fecha (más viejo)" },
]

const FILTER_GRUPOS = [
  {
    label: "Estado",
    opciones: ESTADOS.map((e) => ({ key: e.value, label: e.label })),
  },
  {
    label: "Tipo de entrega",
    opciones: [
      { key: "envio",  label: "Paquete"      },
      { key: "fisica", label: "Punto medio"  },
      { key: "mixto",  label: "Mixto"        },
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

function getEstado(value) {
  return ESTADOS.find((e) => e.value === value) ?? { label: value, color: "gray" }
}

function fmtTipoEntrega(tipo) {
  if (tipo === "envio")  return "Paquete"
  if (tipo === "fisica") return "Punto medio"
  if (tipo === "mixto")  return "Mixto"
  return "—"
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-bg-dark ${className}`} />
}

// ─── Columnas DataTable ───────────────────────────────────────────────────────

const COLUMNAS = [
  {
    key:   "numero_rastreo",
    label: "Número de orden",
    width: "2fr",
  },
  {
    key:   "tipo_entrega",
    label: "Tipo de entrega",
    width: "1fr",
    render: (fila) => (
      <span className="font-body text-sm text-text-regular">
        {fmtTipoEntrega(fila.tipo_entrega)}
      </span>
    ),
  },
  {
    key:   "estado",
    label: "Estado",
    width: "1fr",
    render: (fila) => {
      const e = getEstado(fila.estado)
      return <StatusBadge texto={e.label} color={e.color} />
    },
  },
  {
    key:   "fecha_pedido",
    label: "Fecha",
    width: "1fr",
    render: (fila) => (
      <span className="font-body text-sm text-text-light">
        {fmtFecha(fila.fecha_pedido)}
      </span>
    ),
  },
]

// ─── Componente principal ─────────────────────────────────────────────────────

export function GestionPedidos() {
  const { usuario, cargando: cargandoAuth } = useAuth()
  const {
    pedidos, total, pagina, setPagina, totalPaginas,
    cargando, error,
    busqueda, setBusqueda,
    ordenar, setOrdenar,
    filtros, setFiltros,
    actualizarEstado, obtenerDetalle,
  } = useGestionPedidos()

  const [pedidoDetalle,    setPedidoDetalle]    = useState(null)
  const [cargandoDetalle,  setCargandoDetalle]  = useState(false)

  if (!cargandoAuth && usuario?.tipo_usuario !== "emprendedora") {
    return <Navigate to="/" replace />
  }

  // Valores planos para FilterDropdown
  const valoresFiltros = { ...filtros.estados, ...filtros.tiposEntrega }

  const handleFiltroChange = (nuevos) => {
    setFiltros({
      estados: {
        pendiente:  nuevos.pendiente  ?? filtros.estados.pendiente,
        confirmado: nuevos.confirmado ?? filtros.estados.confirmado,
        enviado:    nuevos.enviado    ?? filtros.estados.enviado,
        entregado:  nuevos.entregado  ?? filtros.estados.entregado,
        cancelado:  nuevos.cancelado  ?? filtros.estados.cancelado,
      },
      tiposEntrega: {
        envio:  nuevos.envio  ?? filtros.tiposEntrega.envio,
        fisica: nuevos.fisica ?? filtros.tiposEntrega.fisica,
        mixto:  nuevos.mixto  ?? filtros.tiposEntrega.mixto,
      },
    })
  }

  const handleVerDetalle = async (idPedido) => {
    try {
      setCargandoDetalle(true)
      const data = await obtenerDetalle(idPedido)
      setPedidoDetalle(data)
    } catch {
      // silencioso
    } finally {
      setCargandoDetalle(false)
    }
  }

  const handleEstadoChange = async (nuevoEstado) => {
    if (!pedidoDetalle) return
    await actualizarEstado(pedidoDetalle.id_pedido, nuevoEstado)
    setPedidoDetalle(null)
  }

  const pedidoModal = pedidoDetalle ? {
    numero_orden: pedidoDetalle.numero_rastreo || `#${pedidoDetalle.id_pedido}`,
    tipo_entrega: pedidoDetalle.tipo_entrega ?? "—",
    fecha:        fmtFecha(pedidoDetalle.fecha),
    estado:       pedidoDetalle.estado,
    cliente:      pedidoDetalle.cliente?.nombre ?? "—",
    total:        pedidoDetalle.total ?? 0,
    metodo_pago:  pedidoDetalle.metodo_pago ?? "—",
    items:        (pedidoDetalle.items ?? []).map((i) => ({
      nombre:   i.nombre,
      cantidad: i.cantidad,
      precio:   i.precio_unitario,
    })),
  } : null

  const datosTabla = pedidos.map((p) => ({
    ...p,
    id:            p.id_pedido,
    numero_rastreo: p.numero_rastreo || `#${p.id_pedido}`,
  }))

  return (
    <>
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-6">

        {/* Título */}
        <h1 className="font-heading text-xl font-bold text-text-dark">
          Gestión de Pedidos
        </h1>

        {/* Barra de controles */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-body text-sm text-text-light">
            {cargando ? "—" : `${total} pedidos activos`}
          </span>

          <span className="text-text-light text-sm">•</span>

          <OrderByDropdown
            opciones={ORDENAR_OPCIONES}
            valorActivo={ordenar}
            onChange={setOrdenar}
          />

          <span className="text-text-light text-sm">•</span>

          {/* Buscar */}
          <div className="flex items-center gap-2 bg-bg-light rounded-lg px-3 py-1.5 shadow-sm flex-1 max-w-56">
            <Icon icon={IconSearch} size={15} color="var(--color-text-light)" />
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
            valores={valoresFiltros}
            onChange={handleFiltroChange}
          />
        </div>

        {/* Tabla */}
        {error ? (
          <p className="text-error text-sm text-center">{error}</p>
        ) : cargando ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : pedidos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Icon icon={IconPackage} size={40} color="var(--color-text-light)" />
            <p className="font-body text-sm text-text-light">No hay pedidos que mostrar</p>
          </div>
        ) : (
          <DataTable
            columnas={COLUMNAS}
            datos={datosTabla}
            onRowClick={(fila) => handleVerDetalle(fila.id_pedido)}
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

      {/* Modal detalle */}
      {pedidoModal && (
        <DetallePedidoModal
          pedido={pedidoModal}
          onClose={() => setPedidoDetalle(null)}
          onEstadoChange={handleEstadoChange}
        />
      )}

      {/* Loading overlay */}
      {cargandoDetalle && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-bg-light rounded-xl px-6 py-4 shadow-lg">
            <p className="font-body text-sm text-text-regular">Cargando detalle...</p>
          </div>
        </div>
      )}
    </>
  )
}